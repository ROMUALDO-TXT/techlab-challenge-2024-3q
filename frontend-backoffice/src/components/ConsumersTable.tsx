import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Box, Typography, IconButton } from '@mui/material';
import { IConsumer } from '../interfaces/IConsumer';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteConsumer } from '../services/api';
import { useCookies } from 'react-cookie';

interface IConsumersTableProps {
    consumers: IConsumer[];
    limit: number;
    page: number;
    setLimit: React.Dispatch<React.SetStateAction<number>>;
    setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const ConsumersTable = ({ consumers, limit, setLimit, page, setPage }: IConsumersTableProps) => {
    const [cookies] = useCookies(['techlab-backoffice-user']);
    
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLimit(parseInt(event.target.value, 10));
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Tem certeza de que deseja deletar este consumidor?');
        if (confirmed) {
            const result = await deleteConsumer(id);
            if (result.status === 200) {
                window.location.reload();
            }
        }
    };

    return (
        <Box sx={{
            padding: '1%'
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 1,
            }}>
                <Typography variant='h4'>Consumidores</Typography>
            </Box>
            <TableContainer sx={{
                background: 'inherit',
                boxShadow: 3,
                borderRadius: 2,
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Sobrenome</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Data de Nascimento</TableCell>
                            {cookies['techlab-backoffice-user'].profile === 'sudo' ?
                                <TableCell></TableCell> : null
                            }                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {consumers ? consumers.map((consumer) => (
                            <TableRow key={consumer.id}>
                                <TableCell>{consumer.firstName}</TableCell>
                                <TableCell>{consumer.lastName}</TableCell>
                                <TableCell>{consumer.email}</TableCell>
                                <TableCell>{new Date(consumer.birthDate).toLocaleDateString()}</TableCell>
                                {cookies['techlab-backoffice-user'].profile === 'sudo' ?
                                <TableCell align="right">
                                    {/* <IconButton color="primary" onClick={() => handleUpdate(consumer)}>
                                        <EditIcon />
                                    </IconButton> */}
                                    <IconButton color="error" onClick={() => handleDelete(consumer.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell> : null}
                            </TableRow>
                        )) : null}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={consumers.length}
                rowsPerPage={limit}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
};

export default ConsumersTable;

