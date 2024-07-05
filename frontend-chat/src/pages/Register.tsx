import { Container, Box } from '@mui/material';
import RegisterForm from '../components/RegisterForm/RegisterForm'; // Import your RegisterForm component

const RegisterPage = () => {
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <RegisterForm />
            </Box>
        </Container>
    );
};

export default RegisterPage;
