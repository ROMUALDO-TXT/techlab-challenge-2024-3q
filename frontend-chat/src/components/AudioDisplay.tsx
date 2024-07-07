import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { displayFile } from '../services/api';

export interface AudioDisplayProps {
    id: string;
}

export const AudioDisplay = ({ id }: AudioDisplayProps) => {

    const [file, setFile] = useState();

    useEffect(() => {
        displayFile(id).then((result) => {
            setFile(result)
        });
    }, [id])


    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <audio controls style={{ width: '100%' }}>
                <source src={id} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        </Box>
    );
};

export default AudioDisplay;