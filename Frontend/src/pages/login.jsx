import { useState  } from "react";
import {useNavigate} from "react-router-dom";
import {Eye, EyeOff} from "lucide-react"
import"../css/login.css"
import axios from "axios";

function Logsign(){
    const [page, setPage] = useState("Login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("");


    const [loginNumber, setLoginNumber] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [message, setMessage] = useState("");

    const navigate = useNavigate();

        
    const login = (
        <form className="auth-form" onSubmit={handleLogin}>
            <h2> {page} </h2>

            <div className="form-group">
                <label>Phone number : </label>
                <input type="tel" value={loginNumber} onChange={(e) => setLoginNumber(e.target.value)} required/>
            </div>

            <br/>
            <br/>

            <div className="pass-box">
                <label>Password : </label>
                <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required/>

                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
            </div>

            <br/>
            <br/>

            <button className="submit-btn" type="submit"> Login </button>

        </form>
    );

    const signIn = (
        <form className="auth-form" onSubmit={handleRegister}>
            <h2> {page} </h2>
             
            <div className="form-group">
                <label>Name : </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required/>
            </div>

            <br/>
            <br/>

            <div className="form-group">
                <label>Email : </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <br/>
            <br/>

            <div className="form-group">
            <label>Phone number : </label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            </div>

            <br/>
            <br/>

            <div className="pass-box">
                <label>Password : </label>
                <input type={ showPassword ?  "text": "password"} value={password} onChange={(e) => setPassword(e.target.value)} required/>

                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20}/>: <Eye size={20}/>}
                </button>

            </div>

            <br/>
            <br/>
            
            <div className="form-group">
                <label>Role</label>

                <select
                value={role}
                onChange={(e) =>
                setRole(e.target.value)
                }
                required
                >
                    <option value="">
                    Select Role
                    </option>

                    
                    <option value="Admin">
                    Admin
                    </option>
                    

                    <option value="Staff">
                    Staff
                    </option>

                    <option value="Guest">
                    Guest
                    </option>
                </select>
            </div>

            <br/>
            <br/>

            <button className="submit-btn" type="submit"> Sign In </button>

        </form>

    )
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    async function handleLogin(e){
        e.preventDefault();

        try {
                const response = await axios.post(
                    `${apiUrl}/api/auth/login`,
                    {
                        phoneNumber: loginNumber,
                        password: loginPassword
                    }
                );

                const result =  response.data;
                setMessage("Login successful");
                localStorage.setItem("currentToken", result.token );
                localStorage.setItem("currentUser", JSON.stringify(result.user)); // Store currentuser data in localStorage
                setTimeout(() => {
                    localStorage.removeItem("currentToken");
                    localStorage.removeItem("currentUser");

                    navigate("/login");
                }, 2 * 60 * 60 * 1000);


                navigate("/home"); // Navigate to home on successful login
         }catch (error) {
            setMessage(error.response?.data?.message || "Login failed");
        }
    }

    async function handleRegister(e){
        e.preventDefault();
        
        try {
                const response = await axios.post(
                    `${apiUrl}/api/auth/register`,
                {
                    name,
                    email,
                    phoneNumber,
                    password,
                    role
                });

                const result = response.data;
                
                setMessage("Registration sucessful");

                setName("");
                setEmail("");
                setPassword("");
                setPhoneNumber("");
                setRole("");

                setPage("login")
            }catch (error) {
            setMessage(error.response?.data?.message || "Registration failed");
        }
    }

    

    return(
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-message">
                    {page === "Login" ? (
                        <>
                           <h1>Welcome Back</h1>
                           <p>
                            Welcome, registered user. We're happy to have you back. Login to continue exploring our bookstore.
                           </p>
                        </>
                    ) :(
                        <>
                            <h1>Welcome, Aspiring guest</h1>
                            <p>
                                Join our growing community of book lovers.Create an account and start your journey with us.
                            </p>
                        </>
                    )}
                </div>
                
                <div className="auth-card">
                    <div className="auth-switch">
                        <button 
                        className={page === "Login"? "active" : ""}
                        onClick={() => {
                            setPage("Login");
                            setMessage("");
                        }}> 
                        Login
                        </button>

                        <button
                        className= {page === "Register"? "active" : ""}
                        onClick={() => {
                            setPage("Register");
                            setMessage("");
                        }}> 
                        Register
                        </button>
                    </div>
                    {message && (
                        <p className="auth-message">
                            {message}
                        </p>
                    )}

                    {page === "Login" && login}
                    {page === "Register" && signIn}
                </div>
            </div>
        </div>
    )
        
}


export default  Logsign