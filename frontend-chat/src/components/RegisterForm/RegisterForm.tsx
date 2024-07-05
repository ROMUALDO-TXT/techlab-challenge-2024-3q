import { useState } from "react";
import { useFormik } from 'formik';
import { useAuth } from "../../contexts/AuthContext";
import * as Yup from 'yup';
import { Container, Box, Typography, TextField, Button, CircularProgress, Grid } from "@mui/material";

export default function RegisterForm() {
    const { signUp } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const formik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            document: "",
            password: "",
            birthDate: "",
        },
        validationSchema: Yup.object({
            firstName: Yup.string()
                .min(2, 'O nome deve ter no mínimo 2 caracteres')
                .max(200, 'Limite de caracteres atingido')
                .required('Digite seu primeiro nome'),
            lastName: Yup.string()
                .min(2, 'O sobrenome deve ter no mínimo 2 caracteres')
                .max(200, 'Limite de caracteres atingido')
                .required('Digite seu sobrenome'),
            email: Yup.string()
                .email('Digite um e-mail válido')
                .required('Digite um e-mail'),
            document: Yup.string()
                .required('Digite seu documento')
                .min(11, 'O documento deve ter no mínimo 11 caracteres'),
            password: Yup.string()
                .required('Digite uma senha')
                .min(6, 'A senha deve ter no mínimo 6 caracteres'),
            birthDate: Yup.date()
                .required('Digite sua data de nascimento')
                .max(new Date(), 'A data de nascimento não pode ser no futuro'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            setError("");
            setIsLoading(true);

            try {
                const response = await signUp({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    document: values.document,
                    password: values.password,
                    birthDate: new Date(values.birthDate),
                });

                if (response.statusCode === 201) {
                    setIsLoading(false);
                    window.location.replace('/');
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
        <Container maxWidth="sm">
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: 5,
                boxShadow: 3,
                borderRadius: 5,
                mt: 4
            }}>
                <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
                    Cadastro
                </Typography>
                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="firstName"
                                name="firstName"
                                label="Nome"
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                helperText={formik.touched.firstName && formik.errors.firstName}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="lastName"
                                name="lastName"
                                label="Sobrenome"
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                helperText={formik.touched.lastName && formik.errors.lastName}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Email"
                                type="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="document"
                                name="document"
                                label="CPF"
                                value={formik.values.document}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.document && Boolean(formik.errors.document)}
                                helperText={formik.touched.document && formik.errors.document}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="password"
                                name="password"
                                label="Senha"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="birthDate"
                                name="birthDate"
                                label="Data de Nascimento"
                                type="date"
                                value={formik.values.birthDate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                                helperText={formik.touched.birthDate && formik.errors.birthDate ? formik.errors.birthDate : ''}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                    {error && (
                        <Typography color="error" gutterBottom>
                            {error}
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} /> : 'Salvar'}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};