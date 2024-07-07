import { Typography, Box } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const icons = [
    <SentimentVeryDissatisfiedIcon sx={{ fontSize: 32, margin: 0 }} />,
    <SentimentDissatisfiedIcon sx={{ fontSize: 32, margin: 0 }} />,
    <SentimentNeutralIcon sx={{ fontSize: 32, margin: 0 }} />,
    <SentimentSatisfiedIcon sx={{ fontSize: 32, margin: 0 }} />,
    <SentimentVerySatisfiedIcon sx={{ fontSize: 32, margin: 0 }} />,
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
    value: number | undefined; // Value from 1 to 5
}

export function LikertIcon({ value }: LikertIconProps) {
    if (!value) {
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

    } else if (value < 1 || value > 5) {
        throw new Error('Value must be between 1 and 5');
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