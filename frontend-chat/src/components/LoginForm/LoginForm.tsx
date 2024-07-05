/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react";
import { useFormik } from 'formik'
import { useAuth } from "../../contexts/AuthContext";
import * as Yup from 'yup';
import { Container, Box, Typography, TextField, Button, CircularProgress } from "@mui/material";


export default function LoginForm() {
  const { signIn } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Digite um e-mail válido').required('Digite um e-mail'),
      password: Yup.string().required('Digite uma senha'),
    }),
    onSubmit: async (e) => {

      setError("");
      setIsLoading(true);

      try {
        console.log(signIn);

        const response = await signIn(e.email, e.password);
        if (response.statusCode === 200) {
          setIsLoading(false);
          window.location.reload();
        } else {
          if (response.message) {
            setError(response.message)
          } else if (response.body) {
            setError(response.body)
          } else {
            setError("Ocorreu um erro");
            alert("Ocorreu um erro inesperado. Tente novamente mais tarde");
          }
        }
      } catch (err) {
        setError("Ocorreu um erro");
        alert("Ocorreu um erro inesperado. Tente novamente mais tarde");
      }

      setIsLoading(false);
    }
  })

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
          Entrar
        </Typography>
        <form onSubmit={formik.handleSubmit}>
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

          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              color="primary"
              variant="contained"
              type="submit"
              disabled={isLoading}
              endIcon={isLoading ? <CircularProgress size={24} /> : null}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </Box>
        </form>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Typography>
            Não possui uma conta? <a href="/register">Cadastre-se!</a>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};