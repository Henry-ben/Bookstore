import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/profile.css"

export default function Profile(){
    const navigate = useNavigate();

    const [user, setUser] = useState(JSON.parse(localStorage.getItem("currentUser")));

    const [businessName, setBusinessName] = useState("");
    const [businessEmail, setBusinessEmail] = useState("");
    const [businessPhone, setBusinessPhone] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [receiptFooter, setReceiptFooter] = useState("");

    const [showProfileModal, setShowProfileModal] = useState(false);

    const [profileImage, setProfileImage] = useState(user?.profileImage || "");
    const [uploadingImage, setUploadingImage] = useState(false);

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");


    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const isAdmin = user?.role === "Admin";

    async function loadSettings(){
        try{
            const response = await axios.get(
            `${apiUrl}/api/settings`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("currentToken")}`,
            },
            });

            setBusinessName(response.data.businessName);
            setBusinessEmail(response.data.businessEmail);
            setBusinessPhone(response.data.businessPhone);
            setBusinessAddress(response.data.businessAddress);
            setReceiptFooter(response.data.receiptFooter);
        }catch(error){
            console.error(error);
        }
    }

    async function uploadImage(e) {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
        setUploadingImage(true);

        const response = await axios.put(
            `${apiUrl}/api/auth/profile/${user.id}/image`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("currentToken")}`
                }
            }
        );

        const updatedUser = response.data.user;

        localStorage.setItem(
            "currentUser",
            JSON.stringify(updatedUser)
        );

        setUser(updatedUser);
        setProfileImage(updatedUser.profileImage);

        alert("Profile image updated successfully!");

    } catch (error) {
        console.error("Error uploading profile image:", error);
        console.log(error.response?.data);

        alert(
            error.response?.data?.message ||
            "Unable to upload profile image."
        );
    } finally {
        setUploadingImage(false);
    }
 }
    async function saveSettings() {
        try{await axios.put(
                `${apiUrl}/api/settings`,
                {
                    businessName,
                    businessEmail,
                    businessPhone,
                    businessAddress,
                    receiptFooter
                },{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("currentToken")}`,
            },
            }
         );

            alert("Settings saved successfully.");
        }catch(error){
            console.error(error);
            alert("Unable to save")
            
        }


}

async function saveProfile() {
    try {
        const response = await axios.put(
            `${apiUrl}/api/auth/profile/${user.id}`,
            {
                name,
                email,
                phoneNumber
            },{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("currentToken")}`,
            },
        }
        );
        const updatedUser = response.data.user;
        localStorage.setItem(
            "currentUser",
            JSON.stringify(updatedUser)
        );
        setUser(updatedUser)
        setName(updatedUser.name)
        setEmail(updatedUser.email)
        setPhoneNumber(updatedUser.phoneNumber)
        setShowProfileModal(false);

        alert("Profile updated successfully!");
        

    } catch (error) {
        console.error(error);
        alert("Unable to update profile.");
    }
}
function closeProfileModal() {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhoneNumber(user?.phoneNumber || "");
    setShowProfileModal(false);
}
    useEffect(() => {
        if(isAdmin){loadSettings()};
    }, [isAdmin]);
    return(
        <div className="profile-page">
           <div className="profile-card">
                <h2>This is the Profile</h2>

                <section>
                    <div className="avatar">
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" />
                        ) : (
                            <p>profile image</p>
                        )}
                    </div>

                    {user && (
                        <div className="image-upload">
                            <label htmlFor="profile-image">{uploadingImage ? "Uploading..." : "Change Image"}</label>
                            <input
                                type="file"
                                id="profile-image"
                                accept="image/*"
                                onChange={uploadImage}
                                disabled={uploadingImage}
                            />
                        </div>
                    )}
                    <p>{user ? user.name : "Guest"}</p>
                    {user &&(
                        <button className="edit-btn" onClick={() => setShowProfileModal(true)}>
                            Edit Profile
                        </button>
                    )}
                </section>
            </div>
            {isAdmin ? (

                <section className="setting-card">
                    <h3>Business Settings</h3>

                    <label>Business Name</label>
                    <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />

                    <label>Business Email</label>
                    <input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)}/>

                    <label>Business Phone</label>
                    <input type="text" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)}/>

                    <label>Business Address</label>
                    <input type="text" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)}/>

                    <label>Receipt Footer</label>
                    <textarea value={receiptFooter} onChange={(e) => setReceiptFooter(e.target.value)}/>

                    <button className="save-btn" onClick={saveSettings}>Save Settings</button>
                </section>
                
            ) : (
                <section className="info-card">
                    <button onClick={() => navigate("/home/your-order")}>Your Order</button>
                    <button onClick={() => navigate("/home")}>Announcement</button>
                </section>
            )}
            <section className="logout-box">
                        <button
                            className="logout-btn"
                            onClick={() => {
                                localStorage.removeItem("currentUser");
                                localStorage.removeItem("currentToken");
                                navigate("/");
                            }}
                        >
                            Logout
                        </button>
            </section>
            {showProfileModal && (
                <div className="modal">
                    <div className="modal-box">

                        <h3>Edit Profile</h3>

                        <label>Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <label>Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <label>Phone Number</label>
                        <input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />

                        <button className="cancel-btn" onClick={closeProfileModal}>
                            Cancel
                        </button>

                        <button className="update-btn" onClick={saveProfile}>
                            Save Changes
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}
