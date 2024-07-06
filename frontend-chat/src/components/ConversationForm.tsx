import { Modal, Box, Button, CircularProgress, IconButton, Paper, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { Dispatch, SetStateAction, useState } from "react";
import * as Yup from 'yup';
import { createConversation } from "../services/api";
import { useCookies } from "react-cookie";
import CloseIcon from '@mui/icons-material/Close';

interface IConversationFormProps {
    open: boolean;
    handleClose: () => void;
    setSelectedConversation: Dispatch<SetStateAction<string>>;
}
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    outline: 0,
};

export const ConversationForm = ({ open, handleClose, setSelectedConversation }: IConversationFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [cookies] = useCookies(['techlab-chat-user']);


    const formik = useFormik({
        initialValues: {
            subject: "",
        },
        validationSchema: Yup.object({
            subject: Yup.string().required('Informe o assunto'),
        }),
        onSubmit: async (values) => {
            setError("");
            setIsLoading(true);

            createConversation(
                values.subject,
                cookies['techlab-chat-user'].id,
                cookies['techlab-chat-user'].name,
            ).then((result) => {
                setIsLoading(false);
                setSelectedConversation(result.data.id)
                handleClose();
            }).catch((err) => {
                console.log(err);
                setError("Ocorreu um erro inesperado. Tente novamente mais tarde");
                setIsLoading(false);
            });
        }
    });


    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
        >
            <Paper sx={modalStyle}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" component="h2">
                        Nova Conversa
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={() => handleClose()}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                <form onSubmit={formik.handleSubmit}>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            id="subject"
                            name="subject"
                            label="Assunto da conversa"
                            value={formik.values.subject}
                            onChange={formik.handleChange}
                            error={formik.touched.subject && Boolean(formik.errors.subject)}
                            helperText={formik.touched.subject && formik.errors.subject}
                            margin="normal"
                        />
                        {error && <Typography color="error">{error}</Typography>}
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Button
                            color="primary"
                            variant="contained"
                            fullWidth
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} /> : "Criar"}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Modal>
    )
}