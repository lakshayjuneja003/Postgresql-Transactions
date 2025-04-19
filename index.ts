import express , {Response , Request} from 'express';
import { Client } from 'pg';

const app = express();
const port = 3000;
const pg = new Client("pgClientUrl");

pg.connect();
app.use(express.json());

app.post("/api/signup" , async (req : Request , res: Response)=>{

    const { email, password , street , city , state , zipcode } = req.body;
    if (!email || !password || !street || !city || !state || !zipcode) {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }
    try {
        const Insertquery = `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id`;
        const AddressQuery = 'Insert into address (user_id ,street , city , state , zipcode) VALUES ($1 , $2 , $3 , $4 , $5)';

        await pg.query("BEGIN");
        const Insertresponse = await pg.query(Insertquery , [email , password])
        const userId = Insertresponse.rows[0].id;
        const Addressresponse = await pg.query(AddressQuery , [userId , street , city , state , zipcode]);
        await pg.query("COMMIT");
        // signup successfully
        res.status(201).json({ message: "User created successfully", userId });
        return ;
    } catch (error) {
        console.error("Error signing in:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
})

app.listen(port , ()=>{
    console.log(`Server is running on port ${port}`);
    console.log(`Postgress is connected`);
})