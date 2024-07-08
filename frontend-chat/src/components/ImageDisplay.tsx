import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import { displayFile } from "../services/api";

export interface ImageDisplayProps{
    id: string;
}

export const ImageDisplay = ({ id }: ImageDisplayProps) => {
    const [_, setFile] = useState();

    useEffect(() => {
        displayFile(id).then((result) => {
            setFile(result)
        }); 
    },[id])
 
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        {/* <img src={} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} /> */}
      </Box>
    );
  };