import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Button, Box, Typography, IconButton } from '@mui/material';
import { IConsumer } from '../interfaces/IConsumer';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteConsumer } from '../services/api';

interface IConsumersTableProps {
    consumers: IConsumer[];
    limit: number;
    page: number;
    setLimit: React.Dispatch<React.SetStateAction<number>>;
    setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const ConsumersTable = ({ consumers, limit, setLimit, page, setPage }: IConsumersTableProps) => {
    // Pagination
    const handleChangePage = (event: unknown, newPage: number) => {
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
            if (result.statusCode === 200) {
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
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {consumers ? consumers.map((consumer) => (
                            console.log(consumer),
                            <TableRow key={consumer.id}>
                                <TableCell>{consumer.firstName}</TableCell>
                                <TableCell>{consumer.lastName}</TableCell>
                                <TableCell>{consumer.email}</TableCell>
                                <TableCell>{new Date(consumer.birthDate).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    {/* <IconButton color="primary" onClick={() => handleUpdate(consumer)}>
                                        <EditIcon />
                                    </IconButton> */}
                                    <IconButton color="error" onClick={() => handleDelete(consumer.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
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

