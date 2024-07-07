import { Modal, Box, TextField, Button, Typography, IconButton, Paper, FormControl, InputLabel, MenuItem, Select, CircularProgress, Grid } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup'
import CloseIcon from '@mui/icons-material/Close';
import { createUser } from '../services/api';
import { useState } from 'react';


interface NewUserFormProps {
    open: boolean;
    onClose: () => void;
}

export const NewUserForm = ({ open, onClose }: NewUserFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");


    const formik = useFormik({
        initialValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            profile: "", // Default profile
        },
        validationSchema: Yup.object({
            username: Yup.string().required('Informe o nome de usuário'),
            email: Yup.string().email('Email inválido').required('Informe o email'),
            password: Yup.string().min(6, 'A senha deve ter pelo menos 6 caracteres').required('Informe a senha'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), undefined], 'As senhas não coincidem')
                .required('Confirme a senha'),
            profile: Yup.string().required('Selecione o perfil'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            setError("");
            setIsLoading(true);

            try {
                const response = await createUser({
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    profile: values.profile
                })
                if (response.status === 201) {
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
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
        >
            <Paper sx={{ p: 3, maxWidth: 600, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" component="h2">
                        Novo Usuário
                    </Typography>
                    <IconButton aria-label="close" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <form onSubmit={formik.handleSubmit}>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            id="username"
                            name="username"
                            label="Nome de Usuário"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            error={formik.touched.username && Boolean(formik.errors.username)}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            type="email"
                            label="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            sx={{ mt: 2 }}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    id="password"
                                    name="password"
                                    type="password"
                                    label="Senha"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    sx={{ mt: 2 }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    label="Confirmar Senha"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                    sx={{ mt: 2 }}
                                />
                            </Grid>
                        </Grid>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="profile-label">Perfil</InputLabel>
                            <Select
                                labelId="profile-label"
                                id="profile"
                                name="profile"
                                value={formik.values.profile}
                                onChange={formik.handleChange}
                                error={formik.touched.profile && Boolean(formik.errors.profile)}
                            >
                                <MenuItem value="standard">Standard</MenuItem>
                                <MenuItem value="sudo">Sudo</MenuItem>
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
                            {isLoading ? <CircularProgress size={24} /> : "Criar"}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Modal >
    );
};


export default NewUserForm;
