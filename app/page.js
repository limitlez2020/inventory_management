// Make this a client sides app:
"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore, storage } from "@/firebase";
import { Box, Stack, Modal, Typography, TextField, Button, Grid } from "@mui/material";
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from "firebase/firestore";
// For uploading images:
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";


export default function Home() {
  // Inventory Management Helper Functions:
  // 1. Store Inventory:
  const [inventory, setInventory] = useState([]);
  // 2. State variables for ___ which we will use to add and remove stuff:
  const [open, setOpen] = useState(false);
  // 3. Item Names:
  const [itemName, setItemName] = useState("");
  // 4. Search Query:
  const [searchQuery, setSearchQuery] = useState("");
  // 5. Image file and URL:
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);



  // Fetch Inventory from Firebase:
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach(doc => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    });

    setInventory(inventoryList)
  }

  // Update inventory whenever the page loads:
  useEffect(() => {
    updateInventory()
  }, [])


  // Add an item to the inventory:
  // Add name, qauntity and image:
  // const addItem = async (item) => {
  //   const imageUrl = await uploadImage(item);
  //   const docRef = doc(collection(firestore, "inventory"), item);
  //   const docSnap = await getDoc(docRef);

  //   if (docSnap.exists()) {
  //     const {quantity} = docSnap.data();
  //     await setDoc(docRef, {quantity: quantity + 1, imageUrl}, {merge: true});
  //   }
  //   else {
  //     await setDoc(docRef, {quantity: 1, imageUrl});
  //   }

  //   await updateInventory();
  // }

  const addItem = async (item) => {
    let imageUrl = null;
  
    // Upload the image if there's an image file
    if (imageFile) {
      imageUrl = await uploadImage(item);
    }
  
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, imageUrl }, { merge: true });
    } else {
      await setDoc(docRef, { quantity: 1, imageUrl });
    }
  
    await updateInventory();
  };
  



  // Remove an item from the inventory:
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      /* Retrieve the quantity and imageURL from document data */
      const {quantity, imageUrl} = docSnap.data();
      /* If quantity is 1, delete item doc from Firestore
       * and remove the image from Firebase Storage:
       */
      if (quantity === 1) {
        await deleteDoc(docRef);
        if (imageUrl) {
          const storageRef = ref(storage, `inventory_images/${item}`);
          await deleteObject(storageRef);
        }
      }
      else {
        await setDoc(docRef, {quantity: quantity - 1}, {merge: true});
      }
    }

    await updateInventory();
  }

  
  // Modal Function:
  const handleOpen = () => {setOpen(true)}
  const handleClose = () => {setOpen(false)}


  // Handle search input change:
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }


  /* Filter Inventory: */
  /* If something is searched, display the item
   * If the searchQuery is empty, just show the whole inventory
   */
  const filteredInventory = searchQuery
  ? inventory.filter(item => {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase())
    })
  : inventory;


  /******* IMAGE FUNCTIONALITY: *******/
  /* Handle image file change: */
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0])
  }

  /* Handle image upload:
   * Upload image and get URL:
   */
  const uploadImage = async (itemName) => {
    if (!imageFile) return;

    const storageRef = ref(storage, `inventory_images/${itemName}`);
    await uploadBytes(storageRef, imageFile);
    const url = await getDownloadURL(storageRef);
    setImageUrl(url);
    return url;
  }


  


  return (
    <Box
      width="100vw"
      height="100vh"
      minHeight={"100vh"}
      // bgcolor={"#EDEEEF"}
    >
      <Box 
        width="100vw"
        height="100vh"
        marginTop="100px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={2}
      >
        {/* Add Modal: */}
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            bgcolor="white"
            border="2px solid #111111"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            sx={{
              transform: "translate(-50%, -50%)",
              width: "350px",
            }}
          >
            <Stack marginBottom={4}>
              <Typography variant="h6">Add New Item</Typography>
              <Typography
                variant="body2"
                color="textSecondary"
              >
                Fill out the form to add a new item
              </Typography>
            </Stack>

            {/* Adding Items: */}
            <Stack width="100%" direction="column" spacing={2}>
              {/* Name: */}
              <Stack display={"flex"} flexDirection={"column"}>
                <Typography variant="body2">Name</Typography>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => {
                    setItemName(e.target.value)
                  }}
                  InputProps={{
                    sx: {
                      height: "40px",
                      border: "0px solid #DAE0E4",
                      borderRadius: 0,
                      fontSize: "0.85rem",
                      '&.MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          border: "1px solid #000",
                        },
                      },
                    }}
                  }
                />
              </Stack>
              

              {/* Image Upload: */}
              <Stack display={"flex"} paddingBottom={1.5}>
                <Typography variant="body2">Image</Typography>
                <Box
                  border={"2px solid #DAE0E4"}
                  padding={1}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ height: "100%" }}
                  />
                </Box>
              </Stack>

              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase())
                  setItemName("")
                  handleClose()
                }}
                sx={{
                  bgcolor: "#111111",
                  color: "#fff",
                  textTransform: "none",
                  fontSize: "0.8rem",
                  borderColor: "#111111",
                  height: "40px",
                  "&:hover": {
                    bgcolor: "#333",
                    color: "#fff",
                    borderColor: "#111111",
                  }
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>





        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent="center"
          alignItems={"center"}
          width={"75%"}
        >
          {/* Search Bar: */}
          <TextField
            variant="outlined"
            display={"flex"}
            placeholder="Search items..."
            value={searchQuery}
            onChange={handleSearch}

            sx={{
              position: "absolute",
              top: "150px",
              /* Total height of the TextField */
              '& .MuiOutlinedInput-root': {
                height: 40,
                width: "100%",
                marginRight: 10,
                border: "1px solid #333",
                borderRadius: 100,
                '&.Mui-focused fieldset': {
                  border: "0px solid #333",
                },
                '& input': {
                  /* Targeting the input element */
                  padding: '10px 14px',
                  fontSize: 13,
                  width: "300px",
                },
              },
            }}
          />
        </Box>



        {/*****************  Display Inventory: ***************/}
        {/* Inventory Title: */}
        <Box
          width="75%" /* Set the same width as the inventory box */
          marginTop={3.5}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          gap={"60%"}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
            }}
          >
            Inventory
          </Typography>

          {/* Adding a new item to the inventory */}
          <Button
            variant="outlined"
            onClick={handleOpen}

            sx={{
              bgcolor: "#111111",
              color: "#fff",
              textTransform: "none",
              fontSize: "0.75rem",
              fontWeight: 600,
              borderColor: "#111111", 
              borderRadius: 0,
              height: "30px",

              "&:hover": {
                bgcolor: "#333",
                color: "#fff",
                borderColor: "#111111", 
              }
            }}
          >
            Add Item
          </Button>
        </Box>

        {/* Inventory List: */}
        <Box width="75%">
          <Grid container rowSpacing={2} columnSpacing={2}>
            {/* Display Inventory: */}
            {filteredInventory.map((item) => (
              <Grid container
                item key={item.name}
                lg={3} md={4} sm={6} xs={12}
                // sx={{
                //   display: "flex",
                //   justifyContent: "space-between",
                // }}
              >
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  // justifyContent="space-between"
                  // alignItems="center"
                  padding={2}
                  border={"3px solid #333"}
                  sx={{
                    width: "100%",
                    // boxSizing: "border-box",
                  }}
                >
                  {/* Display Image in Inventory: */}
                  {/* TODO: Uncomment this and fix the image functionality */}
                  {/* {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={170}
                      height={150}
                    />
                  )} */}
                  {/* Display Item Name & Quantity in Inventory: */}
                  <Box
                    display={"flex"}
                    flexDirection={"column"}
                    alignItems={"flex-start"}
                  >
                    <Typography
                      sx={{
                        marginBottom: -1,
                      }}
                    >
                      {item.name}
                    </Typography>

                    {/* Quantity: */}
                    <Typography
                      sx={{
                        fontSize: "1.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {item.quantity}
                    </Typography>
                  </Box>


                  {/* Add & Remove Buttons: */}
                  <Stack
                    display={"flex"}
                    flexDirection={"row"}
                    gap={1}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    {/* Add Button: */}
                    <Button
                      variant="outlined"
                      onClick={() => {
                        addItem(item.name)
                      }}
                      
                      sx={{
                        bgcolor: "#DDF353",
                        color: "#000",
                        textTransform: "none",
                        fontSize: "0.75rem",
                        borderColor: "#111111", 
                        borderRadius: 0,
                        height: "40px",
                        // width: "110px",
                        minWidth: "115px",
                        
                        "&:hover": {
                          bgcolor: "#DDF353",
                          color: "#000",
                          borderColor: "#fff", 
                          border: "2px solid",
                        }
                      }}
                    >
                      Add
                    </Button>


                    {/* Remove Button: */}
                    <Button
                      variant="outlined"
                      onClick={() => {
                        removeItem(item.name)
                      }}

                      sx={{
                        bgcolor: "#111111",
                        color: "#fff",
                        textTransform: "none",
                        fontSize: "0.75rem",
                        borderColor: "#111111", 
                        borderRadius: 0,
                        height: "40px",
                        // width: "110px",
                        minWidth: "115px",
          
                        "&:hover": {
                          bgcolor: "#333",
                          color: "#fff",
                          borderColor: "#111111", 
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
