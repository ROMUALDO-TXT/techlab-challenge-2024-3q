import { useEffect, useState } from 'react';
import { Radio, RadioGroup, FormControlLabel, Typography, Button, Box } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { IConversationList } from '../interfaces/IConversation';
import { IMessage } from '../interfaces/IMessage';

const icons = [
    <SentimentVeryDissatisfiedIcon sx={{ fontSize: 40 }} />,
    <SentimentDissatisfiedIcon sx={{ fontSize: 40 }} />,
    <SentimentNeutralIcon sx={{ fontSize: 40 }} />,
    <SentimentSatisfiedIcon sx={{ fontSize: 40 }} />,
    <SentimentVerySatisfiedIcon sx={{ fontSize: 40 }} />,
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
interface LikertProps {
    conversation: IConversationList;
    message: IMessage
}

export function LikertScale({ conversation, message }: LikertProps) {
    const [value, setValue] = useState('');
    const [answered, setAnswered] = useState(false);

    useEffect(() => {
        if (conversation.rate) {
            setValue((conversation.rate -1).toString())
            setAnswered(true);
        }
    }, [conversation])

    const handleChange = (_: any) => {
        console.log('not allowed')
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
    };

    return (

        <form onSubmit={handleSubmit}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                width: '100%',
                justifyContent: 'center',
            }}>
                <Typography variant="subtitle1">{message.content}</Typography>
                <RadioGroup
                    value={value}
                    onChange={handleChange}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'center'
                    }}
                >
                    {icons.map((icon, index) => (
                        <FormControlLabel
                            key={`likert-${index}`}
                            value={index}
                            control={
                                <Radio
                                    icon={icon}
                                    checkedIcon={icon}
                                    style={{ color: value === index.toString() ? colors[index] : '' }}
                                />
                            }
                            sx={{
                                fontSize: '10px',
                            }}
                            labelPlacement="bottom"
                            label={
                                <Typography sx={{ fontSize: 12}}>
                                    {text[index]}
                                </Typography>
                            }
                        />
                    ))}
                </RadioGroup>
                {!answered ? (
                    <Button disabled type="submit" variant="contained" color="primary">
                        Enviar
                    </Button>
                ) : (
                    <Typography variant="subtitle1">Obrigado por avaliar!</Typography>
                )}
            </Box>
        </form >
    );
}
