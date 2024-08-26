// import express, { response } from 'express'
// import cors from 'cors'
// import cookieParser from 'cookie-parser'
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import multer from 'multer'
// import path from 'path'


// const app = express();
// app.use(cors(
//     {
//         origin: ["http://localhost:5173"],
//         methods: ["POST", "GET", "PUT", 'DELETE'],
//         credentials: true
//     }
// ));
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.static('public'));


// const con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "signup"
// })

// const storage = multer.diskStorage({

//     destination: (req, file, cb) => {
//         cb(null, 'public/images')
//     },

//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
//     }
// })


// const upload = multer({
//     storage: storage
// })


// con.connect(function(err){

//     if(err) {
//         console.log("Erreur pendant la connexion")
//     } else {
//         console.log("Connecté")

//     }

// })

// app.get('/getStudents', (req, res) => {
//     const sql = "SELECT s.*, f.name as 'forfait_libelle', CONCAT(m.name, ' ', m.lastname) as 'moniteur_libelle' FROM  students s LEFT JOIN forfait f on s.forfait_id = f.id left join moniteurs m on s.moniteur_id = m.id";
//     con.query(sql, (err, result) => {
//         if (err) return res.json({Error: "Get students error in sql"});
//         return res.json({Status: "Success", Result: result})
//     })
// })

// app.get('/getMoniteurs', (req, res) => {
//     const sql = "SELECT * FROM moniteurs";
//     con.query(sql, (err, result) => {
//         if (err) return res.json({Error: "Get moniteurs error in sql"});
//         return res.json({Status: "Success", Result: result})
//     })
// })

// app.get('/getForfait', (req, res) => {
//     const sql = "SELECT * FROM forfait";
//     con.query(sql, (err, result) => {
//         if (err) return res.json({Error: "Get forfait error in sql"});
//         return res.json({Status: "Success", Result: result})
//     })
// })

// app.get('/get/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "SELECT * FROM students where id = ?";
//     con.query(sql, [id], (err, result) => {
//         if(err) return res.json({Error: "Get students error in sql"});
//         return res.json({Status: "Success", Result: result})
//     })
// })


// app.get('/getm/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "SELECT * FROM moniteurs where id = ?";
//     con.query(sql, [id], (err, result) => {
//         if(err) return res.json({Error: "Get moniteurs error in sql"});
//         return res.json({Status: "Success", Result: result})
//     })
// })

// app.get('/getf/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "SELECT * FROM forfait where id = ?";
//     con.query(sql, [id], (err, result) => {
//         if(err) return res.json({Error: "Get forfait error in sql"});
//         return res.json({Status: "Success", Result: result})
//     })
// })

// app.put('/update/:id', (req, res) => {
//     const id = req.params.id;
//     const newName = req.body.name;
//     const newLastname = req.body.lastname;
//     const newPhone = req.body.phone;
//     const newEmail = req.body.email;
//     const newAddress = req.body.address;
//     const newHeure = req.body.heure;
//     const newHeuresup = req.body.heuresup;

//     const sql = "UPDATE students SET name = ?, lastname = ?, phone = ?, email = ?, address = ?, heure = ?, heuresup = ? WHERE id = ?";
    
//     con.query(sql, [newName, newLastname, newPhone, newEmail, newAddress, newHeure, newHeuresup, id], (err, result) => {
//         if (err) {
//             return res.json({ Error: "Update students error in SQL" });
//         }
        
//         if (result.affectedRows === 0) {
//             // No rows were updated, indicating that there was no matching record.
//             return res.status(404).json({ Error: "No matching moniteur found for update" });
//         }
        
//         return res.json({ Status: "Success" });
//     });
// });


// app.put('/updatem/:id', (req, res) => {
//     const id = req.params.id;
//     const newName = req.body.name;
//     const newLastname = req.body.lastname;
//     const newEmail = req.body.email;
//     const newAddress = req.body.address;
//     const newPhone = req.body.phone;
    
//     const sql = "UPDATE moniteurs SET name = ?, lastname = ?, email = ?, address = ?, phone = ? WHERE id = ?";
    
//     con.query(sql, [newName, newLastname, newEmail, newAddress, newPhone, id], (err, result) => {
//         if (err) {
//             return res.json({ Error: "Update moniteurs error in SQL" });
//         }
        
//         if (result.affectedRows === 0) {
//             // No rows were updated, indicating that there was no matching record.
//             return res.status(404).json({ Error: "No matching moniteur found for update" });
//         }
        
//         return res.json({ Status: "Success" });
//     });
// });

// app.put('/updatef/:id', (req, res) => {
//     const id = req.params.id;
//     const newName = req.body.name;
//     const newHeure = req.body.heure;
    
//     const sql = "UPDATE forfait SET name = ?, heure = ? WHERE id = ?";
    
//     con.query(sql, [newName, newHeure, id], (err, result) => {
//         if (err) {
//             return res.json({ Error: "Update forfait error in SQL" });
//         }
        
//         if (result.affectedRows === 0) {
//             // No rows were updated, indicating that there was no matching record.
//             return res.status(404).json({ Error: "No matching forfait found for update" });
//         }
        
//         return res.json({ Status: "Success" });
//     });
// });




// app.delete('/delete/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "Delete FROM students WHERE id = ?";
//     con.query(sql, [id], (err, result) => {
//         if (err) return res.json({Error: "delete students error in sql"});
//         return res.json({Status: "Success"})
//     })
// })

// app.delete('/deletemoniteurs/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "Delete FROM moniteurs WHERE id = ?";
//     con.query(sql, [id], (err, result) => {
//         if (err) return res.json({Error: "delete moniteurs error in sql"});
//         return res.json({Status: "Success"})
//     })
// })

// app.delete('/deleteforfait/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "Delete FROM forfait WHERE id = ?";
//     con.query(sql, [id], (err, result) => {
//         if (err) return res.json({Error: "delete forfait error in sql"});
//         return res.json({Status: "Success"})
//     })
// })

// const verifyUser = (req, res, next) => {
//     const token = req.cookies.token;
//     if(!token) {
//         return res.json({Error: "Vous n'êtes pas Authentifié"})
//     } else {
//         jwt.verify(token, "jwt-secret-key", (err, decoded) => {
//             if(err) return res.json({Error: "Token wrong"});
//             req.role = decoded.role;
//             req.id = decoded.id;
//             next();
//         })
//     }
// }

// app.get('/dashboard', verifyUser, (req, res) => {
//     return res.json({Status: "Success", role: req.role, id: req.id})
// })


// app.get('/adminCount', (req, res) => {
//     const sql = "Select count(id) as admin from users";
//     con.query(sql, (err, result) => {
//         if(err) return res.json({Error: "Error in running query"});
//         return res.json(result);
//     })
// })

// app.get('/moniteursCount', (req, res) => {
//     const sql = "Select count(id) as moniteurs from moniteurs";
//     con.query(sql, (err, result) => {
//         if(err) return res.json({Error: "Error in running query"});
//         return res.json(result);
//     })
// })


// app.get('/studentsCount', (req, res) => {
//     const sql = "Select count(id) as students from students";
//     con.query(sql, (err, result) => {
//         if(err) return res.json({Error: "Error in running query"});
//         return res.json(result);
//     })
// })

// app.get('/heure', (req, res) => {
//     const sql = "Select sum(heure) as sumOfHeure from students";
//     con.query(sql, (err, result) => {
//         if(err) return res.json({Error: "Error in running query"});
//         return res.json(result);
//     })
// })

// app.post('/login', (req, res) => {
//     const sql = "SELECT * FROM users Where email = ? AND password = ?";
//     con.query(sql, [req.body.email, req.body.password], (err, result) => {
//         if(err) return res.json({Status: "Error", Error: "Error in running query"});
//         if (result.length > 0) {
//             const id = result[0].id;
//             const token = jwt.sign({role: "admin"}, "jwt-secret-key", {expiresIn: '1d'});
//             res.cookie('token', token);
//             return res.json({Status: "Success"})
//         } else {
//             return res.json({Status: "Error", Error: "E-mail ou Mot de passe Incorrect"});
//         }
//     })
// })


// app.post('/studentslogin', (req, res) => {
//     const sql = "SELECT * FROM students Where email = ?";
//     con.query(sql, [req.body.email], (err, result) => {
//         if(err) return res.json({Status: "Error", Error: "Error in running query"});
//         if (result.length > 0) {
//             bcrypt.compare(req.body.password.toString(), result[0].password, (err, response)=> {
//                 if(err) return res.json({Error: "password error"});

//             const token = jwt.sign({role: "students", id: result[0].id}, "jwt-secret-key", {expiresIn: '1d'});
//             res.cookie('token', token);
//             return res.json({Status: "Success", id: result[0].id})
//             })
            
//         } else {
//             return res.json({Status: "Error", Error: "E-mail ou Mot de passe Incorrect"});
//         }
//     })
// })


// // app.get('/students/:id', (req, res) => {
// //     const id = req.params.id;
// //     const sql = "SELECT * FROM students where id = ?";
// //     con.query(sql, [id], (err, result) => {
// //         if(err) return res.json({Error: "Get students error in sql"});
// //         return res.json({Status: "Success", Result: result})
// //     })
// // })

// app.get('/logout', (req, res) =>{
//     res.clearCookie('token');
//     return res.json({Status: "Success"});
// })



// // app.post('/create', upload.single('image'), (req, res) => {
// //    const sql = "INSERT INTO students (`name`, `lastname`, `phone`,`email`,`password`,`address`,`heure`, `heuresup`,`image`) VALUES (?)";
// //    bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
// //     if(err) return res.json({Error: "Error in hashing password"});
// //     const values = [
// //         req.body.name,
// //         req.body.lastname,
// //         req.body.phone,
// //         req.body.email,
// //         hash,
// //         req.body.address,
// //         req.body.heure,
// //         req.body.heuresup,
// //         req.file.filename
// //     ]
// //     con.query(sql, [values], (err, result) => {
// //         if(err) return res.json({Error: "Inside signup query"});
// //         return res.json({Status: "Success"});
// //     })
// //    })
// // })

// app.post('/create', upload.single('image'), (req, res) => {
//     // Hash the password
//     bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
//         if (err) return res.json({ Error: "Error in hashing password" });
//         // Insert the student data into the database, including the forfait_id
//         const sql = `
//             INSERT INTO students 
//                 (name, lastname, phone, email, password, address, heure, heuresup, image, forfait_id, moniteur_id)
//             VALUES (?)
//         `;

//         const values = [
//             req.body.name,
//             req.body.lastname,
//             req.body.phone,
//             req.body.email,
//             hash,
//             req.body.address,
//             req.body.heure,
//             req.body.heuresup,
//             req.file.filename,
//             req.body.selectedForfait,
//             req.body.selectedMonitor
//         ];

//         con.query(sql, [values], (err, result) => {
//             if (err) {
//                 return res.json({ Error: "Error in inserting student data" });
//             }
//             return res.json({ Status: "Success" });
//         });
//     });
// });


// app.post('/createmoniteurs', upload.single('image'), (req, res) => {
//     const sql = "INSERT INTO moniteurs (`name`, `lastname`, `phone`,`email`,`password`,`address`,`image`) VALUES (?)";
//     bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
//      if(err) return res.json({Error: "Error in hashing password"});
//      const values = [
//          req.body.name,
//          req.body.lastname,
//          req.body.phone,
//          req.body.email,
//          hash,
//          req.body.address,
//          req.file.filename
//      ]
//      con.query(sql, [values], (err, result) => {
//          if(err) return res.json({Error: "Inside signup query"});
//          return res.json({Status: "Success"});
//      })
//     })
//  })

//  app.post('/createforfait', upload.single('image'), (req, res) => {
//     const sql = "INSERT INTO forfait (`name`, `heure`) VALUES (?)";
//      const values = [
//          req.body.name,
//          req.body.heure
//      ]
//      con.query(sql, [values], (err, result) => {
//          if(err) return res.json({Error: "Inside signup query"});
//          return res.json({Status: "Success"});
//      })
//     })



 

// app.listen(8081, ()=> {
//     console.log("Running")

// })