import { Request, Response } from "express";
import { User } from "../entities/User.js";
import { database } from "../services/database.js";

export class UsersController {
  protected get repository() {
    return database.getRepository(User)
  }

  /**
   * GET /users
   */
  public async find(req: Request, res: Response) {
    const {skip, take} = req.query;

    const [users, count] = await this.repository.findAndCount({
      take: Number(take),
      skip: Number(skip),
    })

    res.json({ count, users })
  }

  /**
   * GET /users/:user-id
   */
  public async findOne(req: Request<{ userId: string }>, res: Response) {
    const user = await this.repository.findOne({
      where: { id: req.params.userId }
    })
    
    if (!user) return res.status(404).json({ message: `Not found User with ID ${req.params.userId}` })
    
    return res.json(user)
  }

  public async findByUsername(req: Request, res: Response){
    const user = await this.repository.findOne({
      where: { 
        username: req.params.username 
      },
      select:{
        username: true,
        email: true,
        id: true,
      }
    })
    
    return res.json(user)
  }

  public async findByEmail(req: Request, res: Response){
    const user = await this.repository.findOne({
      where: { 
        email: req.params.email 
      },
      select:{
        username: true,
        email: true,
        id: true,
      }
    })
    
    return res.json(user)
  }

  public async create(req: Request, res: Response){
    const {
      username,
      email,
      password,
      profile
    } = req.body;

    //pswd hashing

    const user = await this.repository.save(this.repository.create({
      username,
      email,
      password,
      profile
    }))

    res.status(201)
      .header('Location', `/users/${user.id}`)
      .json(user)
  }

  /**
   * PUT /users
   */
  public async save(req: Request, res: Response) {
    const {
      id,
      username,
      email,
      password,
      profile
    } = req.body;

    let userToBeSaved = this.repository.create({
      username,
      email,
      password,
      profile
    }); 

    if(id){
      const userExists = await this.repository.findOne({
        where:{
          id: id
        }
      })

      if(userExists) userExists;
    }

    const user = await this.repository.save(req.body)

    res.status(201)
      .header('Location', `/users/${user.id}`)
      .json(user)
  }

  /**
   * PATCH /users/:user-id
   */
  public async update(req: Request<{ userId: string }>, res: Response) {
    const user = await this.repository.findOne({
      where: { id: req.params.userId }
    })

    if (!user) return res.status(404).json({ message: `Not found User with ID ${req.params.userId}` })

    await this.repository.save(
      this.repository.merge(user, req.body)
    )

    res.json(user)
  }

  /**
   * DELETE /users/:user-id
   */
  public async delete(req: Request<{ userId: string }>, res: Response) {
    const user = await this.repository.findOne({
      where: { id: req.params.userId }
    })

    if (!user) return res.status(404).json({ message: `Not found User with ID ${req.params.userId}` })

    await this.repository.softRemove(user)

    res.json(user)
  }
}
