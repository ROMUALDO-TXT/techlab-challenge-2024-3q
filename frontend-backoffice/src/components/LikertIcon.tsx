import { Typography, Box } from '@mui/material';
import {
    SentimentVeryDissatisfied as SentimentVeryDissatisfiedIcon,
    SentimentDissatisfied as SentimentDissatisfiedIcon,
    SentimentNeutral as SentimentNeutralIcon,
    SentimentSatisfied as SentimentSatisfiedIcon,
    SentimentVerySatisfied as SentimentVerySatisfiedIcon,
} from '@mui/icons-material';

const icons = [
    <SentimentVeryDissatisfiedIcon sx={{ fontSize: 32 }} />,
    <SentimentDissatisfiedIcon sx={{ fontSize: 32 }} />,
    <SentimentNeutralIcon sx={{ fontSize: 32 }} />,
    <SentimentSatisfiedIcon sx={{ fontSize: 32 }} />,
    <SentimentVerySatisfiedIcon sx={{ fontSize: 32 }} />,
];

const text = [
    "Muito Insatisfeito",
    "Insatisfeito",
    "Regular",
    "Satisfeito",
    "Muito Satisfeito",
];

const colors = [
    'red',
    'orange',
    '#EED202',
    '#50C878',
    'green',
];

interface LikertIconProps {
    value?: number; // Value from 1 to 5 or undefined
}

export function LikertIcon({ value }: LikertIconProps) {
    if (value === undefined) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: 'grey',
            }}>
                <SentimentNeutralIcon sx={{ fontSize: 32 }} />
                <Typography margin="0">Não avaliado</Typography>
            </Box>
        );
    }

    if (value < 1 || value > 5) {
        // Handle out-of-range values gracefully, maybe display a default state
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: 'grey',
            }}>
                <SentimentNeutralIcon sx={{ fontSize: 32 }} />
                <Typography margin="0">Valor inválido</Typography>
            </Box>
        );
    }

    const index = value - 1;

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: colors[index],
        }}>
            {icons[index]}
            <Typography margin="0">{text[index]}</Typography>
        </Box>
    );
}
