import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ProfilesAllowed } from 'src/auth/decorators/profiles.decorator';
import { readFileSync } from 'fs';
import { Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { globalFileInterceptor } from 'src/domain/config/multer.config';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo documento geral'
  })
  @ProfilesAllowed('sudo', 'standard', 'consumer')
  @UseInterceptors(
    globalFileInterceptor
  )
  async upload(@Body() createFileDto: CreateFileDto, @UploadedFile() file: Express.Multer.File, @Res() response: Response) {
    const res = await this.filesService.create(createFileDto, file);
    return response.status(res.status).send(res);
  }

  @Get('download/:id')
  @ProfilesAllowed('consumer', 'standard', 'standard')
  async downloadDocumento(@Param('id') id: string, @Res() res: Response) {
    const result = await this.filesService.findDocumentoById(id);
    console.log(result);
    if(!result) return res.status(404).send({
      message: 'Documento não encontrado',
      status: 404,
    });
    const file = readFileSync(result.url)
    res.contentType(result.type);
    res.send(file);
  }

  @Get('preview/:id')
  @ProfilesAllowed('consumer', 'standard', 'standard')
  async previewDocumento(@Param('id') id: string, @Res() res: Response) {
    const result = await this.filesService.findDocumentoById(id);
    if (!result) return res.status(404).send({
      message: 'Documento não encontrado',
      status: 404,
    });

    const file = readFileSync(result.url)
    res.setHeader('Content-disposition', `inline; filename=${result.name}`);
    res.contentType(result.type);
    res.send(file);
  }

}
