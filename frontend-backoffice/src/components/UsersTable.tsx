import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Button, Box, Typography, IconButton } from '@mui/material';
import { IUser } from '../interfaces/IUser';
import { AddCircle } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteUser } from '../services/api';
import { useCookies } from 'react-cookie';

interface IUsersTableProps {
    users: IUser[];
    limit: number;
    page: number;
    setLimit: React.Dispatch<React.SetStateAction<number>>;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    onCreateNewUser: () => void;
}

export const UsersTable = ({ users, onCreateNewUser, limit, setLimit, page, setPage }: IUsersTableProps) => {
    const [cookies] = useCookies(['techlab-backoffice-user']);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLimit(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleUpdate = (event: unknown) => {

    }

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Tem certeza de que deseja deletar este usuário?');
        if (confirmed) {
            const result = await deleteUser(id);
            if (result.status === 200) {
                window.location.reload();
            }
        }
    };

    // Table headers
    const tableHeaders = ['Email', 'Username', 'Disponível', 'Avaliação', 'Perfil', 'Ações'];

    return (
        <Box sx={{
            padding: '1%'
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 1,
            }}>
                <Typography variant='h4'>Usuários</Typography>
                {cookies['techlab-backoffice-user'].profile === 'sudo' ?
                    (<Button
                        variant="contained"
                        color="primary"
                        onClick={onCreateNewUser}
                        sx={{ marginBottom: 2 }}
                    >
                        Novo usuário
                        <AddCircle sx={{ marginLeft: "8px" }} />
                    </Button>) : null}
            </Box>
            <TableContainer sx={{
                background: 'inherit',
                boxShadow: 3,
                borderRadius: 2,
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Disponível</TableCell>
                            <TableCell>Avaliação</TableCell>
                            <TableCell>Perfil</TableCell>
                            {cookies['techlab-backoffice-user'].profile === 'sudo' ?
                                <TableCell></TableCell> : null
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users ? users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.available ? 'Sim' : 'Não'}</TableCell>
                                <TableCell>{user.ratings ? Number(user.ratings).toFixed(1) : "Sem avaliações"}</TableCell>
                                <TableCell>{user.profile}</TableCell>
                                {cookies['techlab-backoffice-user'].profile === 'sudo' ?
                                    <TableCell align="right">
                                        {/* <IconButton color="primary" onClick={() => handleUpdate(user.id)}>
                                        <EditIcon />
                                    </IconButton> */}
                                        <IconButton color="error" onClick={() => handleDelete(user.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                    : null}
                            </TableRow>
                        )) : null}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={users.length}
                rowsPerPage={limit}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
};

export default UsersTable;
