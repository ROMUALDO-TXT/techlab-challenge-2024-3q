import { Container, Box } from '@mui/material';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 16 }}>
                <LoginForm />
            </Box>
        </Container>
    );
};

export default LoginPage;