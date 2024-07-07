import { useEffect, useState } from 'react';
import { Radio, RadioGroup, FormControlLabel, Typography, Button, Box } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { rateConversation } from '../services/api';
import { IConversationList } from '../interfaces/IConversation';

const icons = [
    <SentimentVeryDissatisfiedIcon sx={{ fontSize: 40 }} />,
    <SentimentDissatisfiedIcon sx={{ fontSize: 40 }} />,
    <SentimentNeutralIcon sx={{ fontSize: 40 }} />,
    <SentimentSatisfiedIcon sx={{ fontSize: 40 }} />,
    <SentimentVerySatisfiedIcon sx={{ fontSize: 40 }} />,
];

const colors = [
    'red',
    'orange',
    '#EED202',
    '#50C878',
    'green',
];
interface LikertProps {
    conversation: IConversationList | undefined;
}

export function LikertScale({ conversation }: LikertProps) {
    const [value, setValue] = useState('');
    const [answered, setAnswered] = useState(false);

    useEffect(() => {
        if (conversation?.rate) {
            setValue((conversation.rate - 1).toString())
            setAnswered(true);
        }
    }, [conversation])

    const handleChange = (e: any) => {
        if (!answered)
            setValue(e.target.value);
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        console.log(`Selected value: ${value}`);
        if (!answered && conversation)
            rateConversation(Number(value), conversation.id)
    };

    return (

        <form onSubmit={handleSubmit}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                justifyContent: 'center',
            }}>
                <Typography variant="subtitle1">Como avalia este atendimento?</Typography>
                <RadioGroup
                    value={value}
                    onChange={handleChange}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',

                    }}
                >
                    {icons.map((icon, index) => (
                        <FormControlLabel
                            key={`likert-${index}`}
                            value={index.toString()}
                            control={
                                <Radio
                                    icon={icon}
                                    checkedIcon={icon}
                                    style={{ color: value === index.toString() ? colors[index] : '' }}
                                />
                            }
                            sx={{
                                margin: "auto 2px"
                            }}
                            labelPlacement="bottom"
                            label={undefined}
                        />
                    ))}
                </RadioGroup>
                {!answered ? (
                    <Button type="submit" variant="contained" color="primary">
                        Enviar
                    </Button>
                ) : null}
            </Box>
        </form >
    );
}
