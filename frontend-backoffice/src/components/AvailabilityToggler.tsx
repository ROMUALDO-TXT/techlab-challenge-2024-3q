import { useEffect, useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { getAvailabilityStatus, updateAvailability } from '../services/api';

export const AvailabilityToggler = () => {
    const [isAvailable, setIsAvailable] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAvailabilityStatus().then((result) => {
            setIsAvailable(result.data.available);
        });
    }, []);

    const toggleAvailability = async () => {
        setLoading(true);
        try {
            const response = await updateAvailability({ available: !isAvailable });
            console.log(response);

            if (response.status === 200) {
                setIsAvailable(response.data.available);
            } else {
                alert('Failed to toggle availability');
            }
        } catch (error) {
            console.error('Error toggling availability:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
            }}
        >
            <Button
                onClick={toggleAvailability} // Corrected to use onClick instead of onChange
                color={isAvailable ? 'success' : 'error'}
                variant="contained"
                disabled={loading}
                sx={{
                    width: '100%',
                    padding: 1,
                }}
            >
                <Typography  color="inherit">
                    {isAvailable ? 'Disponível' : 'Indisponível'}
                </Typography>
            </Button>
        </Box>
    );
};
