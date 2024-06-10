"use client";
import { createClient } from "@supabase/supabase-js";
import { useRef, useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

// Add clerk to Window to avoid type errors
declare global {
  interface Window {
    Clerk: any;
  }
}

function createClerkSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await window.Clerk.session?.getToken({
            template: "supabase",
          });

          const headers = new Headers(options?.headers);
          headers.set("Authorization", `Bearer ${clerkToken}`);

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}

const client = createClerkSupabaseClient();

export default function Supabase() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
        console.log('Delayed message');
        listAddresses();
        console.log("useEffect");
      }, 400 ); 

 
    
  }, []);
  const listAddresses = async () => {
    setLoading(true);
    const { data, error } = await client.from("Addresses").select();
    if (error) {
      setError(error.message);
      //console.error(error);
    } else {
       // console.log("data",error,data);
      setAddresses(data);
    }
    setLoading(false);
  };

  const handleAddressSubmit = async () => {
    if (!inputRef.current?.value) return;
    const content = inputRef.current.value;

    const { error } = editId
      ? await client.from("Addresses").update({ content }).eq("id", editId)
      : await client.from("Addresses").insert({ content });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(editId ? "Address updated successfully!" : "Address added successfully!");
      inputRef.current.value = "";
      setEditId(null);
      listAddresses();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await client.from("Addresses").delete().eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Address deleted successfully!");
      listAddresses();
    }
  };

  const handleEdit = (address: any) => {
    setEditId(address.id);
    inputRef.current!.value = address.content;
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Container>
      <div style={{ display: "flex", flexDirection: "column", marginTop: "20px" }}>
        <TextField
          label="Address"
          variant="outlined"
          inputRef={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddressSubmit();
          }}
        />
        <Button variant="contained" color="primary" onClick={handleAddressSubmit} style={{ marginTop: "10px" }}>
          {editId ? "Update Address" : "Add Address"}
        </Button>
        {loading && <CircularProgress style={{ marginTop: "20px" }} />}
        <List style={{ marginTop: "20px" }}>
          {addresses.map((address) => (
            <ListItem
              key={address.id}
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(address)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(address.id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText primary={address.content} />
            </ListItem>
          ))}
        </List>
      </div>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}
