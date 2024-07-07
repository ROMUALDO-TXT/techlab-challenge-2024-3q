import React, { useEffect, useState } from 'react';
import { Box, Link } from '@mui/material';
import { displayFile } from '../services/api';

export interface FileDisplayProps{
    id: string;
}

export const FileDisplay = ({ id }: FileDisplayProps) => {
    const [file, setFile] = useState();

    useEffect(() => {
        displayFile(id).then((result) => {
            setFile(result)
        }); 
    },[id])
 
    return (
    <Box display="flex" justifyContent="center" alignItems="center">
      {/* <Link href={url} download={fileName} target="_blank" rel="noopener noreferrer">
        {fileName}
      </Link> */}
    </Box>
  );
};

export default FileDisplay;