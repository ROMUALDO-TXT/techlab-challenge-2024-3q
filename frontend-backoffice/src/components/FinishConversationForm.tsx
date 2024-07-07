import { Modal, Box, Button, Typography, IconButton, Paper, FormControl, InputLabel, MenuItem, Select, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { finishConversation } from '../services/api';

interface FinishTicketFormProps {
    conversationId: string;
    open: boolean;
    onClose: () => void;
}

export const FinishConversationForm = ({ conversationId, open, onClose }: FinishTicketFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const formik = useFormik({
        initialValues: {
            reason: "", // Default reason
        },
        validationSchema: Yup.object({
            reason: Yup.string().required('Selecione o motivo'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            setError("");
            setIsLoading(true);

            try {
                const response = await finishConversation(conversationId, values.reason)
                if (response.status === 200) {
                    setIsLoading(false);
                    window.location.reload();
                } else {
                    if (response.message) {
                        if (Array.isArray(response.message)) {
                            setError(response.message.map((message: string) => {
                                if (message.substring(0, 5) === "Erro:") {
                                    return message + ' ';
                                }
                                return ''
                            }))
                        } else {
                            setError(response.message);
                        }
                    } else if (response.body) {
                        setError(response.body)
                    } else {
                        setError("Ocorreu um erro");
                        alert("Ocorreu um erro inesperado. Tente novamente mais tarde");
                    }
                }
            } catch (err) {
                console.log(err)
                setError("Ocorreu um erro");
                alert("Ocorreu um erro inesperado. Tente novamente mais tarde");
            }

            setIsLoading(false);
            setSubmitting(false);
        }
    });

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="finish-ticket-modal-title"
            aria-describedby="finish-ticket-modal-description"
        >
            <Paper sx={{ p: 3, maxWidth: 600, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" component="h2">
                        Finalizar Atendimento
                    </Typography>
                    <IconButton aria-label="close" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <form onSubmit={formik.handleSubmit}>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="reason-label">Motivo</InputLabel>
                            <Select
                                labelId="reason-label"
                                id="reason"
                                name="reason"
                                value={formik.values.reason}
                                onChange={formik.handleChange}
                                error={formik.touched.reason && Boolean(formik.errors.reason)}
                            >
                                <MenuItem value="concluded">Atendimento Concluído</MenuItem>
                                <MenuItem value="timed-out">Tempo esgotado</MenuItem>
                            </Select>
                        </FormControl>
                        {error && <Typography mt={1} textAlign={'center'} color="error">{error}</Typography>}
                    </Box>
                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button
                            color="primary"
                            variant="contained"
                            fullWidth
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} /> : "Finalizar"}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Modal>
    );
};

export default FinishConversationForm;