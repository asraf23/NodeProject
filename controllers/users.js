const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { promisify } = require("util");
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(req.body);
    if (!username || !password) {
      res.render("login", {
        msg: "Please Enter Username and Password",
        msg_type: "error",
      });
    } else {
      db.query(
        "select * from users where username=?",
        [username],
        async (err, result) => {
          //   console.log(result);
          if (result.length <= 0) {
            res.render("login", {
              msg: "Wrong Username and Password",
              msg_type: "error",
            });
          } else {
            if (!(await bcrypt.compare(password, result[0].passwod))) {
              res.render("login", { msg: "Wrong Password", msg_type: "error" });
            } else {
              //
              const id = result[0].id;
              const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_TOKEN_EXPIRY,
              });
              // console.log(token);
              const cookie = {
                expire: new Date(
                  Date.now() + process.env.JWT_cookie * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
              };
              res.cookie("cookie", token, cookie);
              res.redirect("/home");
            }
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};
exports.register = (req, res) => {
  const { name, username, password, conf_password } = req.body;
  //   console.log(name);
  //   console.log(username);
  //   console.log(req.body);

  db.query(
    "select username from users where username=?",
    [username],
    async (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.length > 0) {
        return res.render("register", {
          msg: "username already exist",
          msg_type: "error",
        });
      } else if (password !== conf_password) {
        return res.render("register", {
          msg: "Password Mismatch",
          msg_type: "error",
        });
      }
      let encrypt_pass = await bcrypt.hash(password, 8);
      db.query(
        "insert into users set?",
        { name: name, username: username, passwod: encrypt_pass },
        (error, result) => {
          if (error) {
            console.log(error);
          } else {
            return res.render("register", {
              msg: "Registration Successfull",
              msg_type: "success",
            });
          }
        }
      );
    }
  );
};
exports.isLogedIn = async (req, res, next) => {
  // console.log(req.cookies)
  if (req.cookies.cookie) {
    const decode = await promisify(jwt.verify)(
      req.cookies.cookie,
      process.env.JWT_SECRET
    );
    // console.log(decode)
    // console.log(decode.id)
    const id = decode.id;
    db.query("select * from users where id=?", [id], (err, result) => {
      req.user = result[0];

      db.query("select * from emp_details ", (err, result) => {
        if (err) {
          console.log(err);
        } else {
          req.result = result;
          next();
        }
      });

      // console.log(result)
      // console.log(req.user.name)
    });
  } else {
    next();
  }
};
exports.logout = async (req, res) => {
  // console.log(req.cookies)
  res.cookie("cookie", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });
  res.status(200).redirect("/login");
};
exports.adduser = async (req, res) => {
  // console.log(req.body);
  const {
    employee_name,
    employee_number,
    doj,
    department,
    designation,
    branch,
    salary,
  } = req.body;
  // console.log(employee_number);
  await db.query(
    "select * from emp_details where employee_number=?",
    [employee_number],
    (err, result) => {
      if (result.length !== 0) {
        // console.log(result);
        res.redirect("/home?msg=Employee+already+exist&msg_type=error");
      } else {
        db.query(
          "insert into emp_details set?",
          {
            employee_name,
            employee_number,
            doj,
            department,
            designation,
            branch,
            salary,
          },
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.redirect(
                "/home?msg=user+added+successfully&msg_type=success"
              );
            }
          }
        );
      }
    }
  );
};
exports.edituser = (req, res, next) => {
  const id = req.params.id;
  db.query("select * from emp_details where id=?", [id], (err, result) => {
    // console.log(result);
    req.data = result[0];
    next();
  });
};
exports.edit = (req, res) => {
  const id = req.params.id;
  const {
    employee_name,
    employee_number,
    doj,
    department,
    designation,
    branch,
    salary,
  } = req.body;

  // console.log(id,"req.bodyreq.body");

  db.query(
    "UPDATE emp_details SET employee_name=?, employee_number=?, doj=?, department=?, designation=?, branch=?, salary=? WHERE id=?",
    [
      employee_name,
      employee_number,
      doj,
      department,
      designation,
      branch,
      salary,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating employee details:", err.message);
        res.redirect("/home?msg=update+failed&msg_type=error");
        return;
      }

      // console.log("Rows affected:", result.affectedRows);
      res.redirect(
        "/home?msg=employee+details+updated+successfully&msg_type=success"
      );
    }
  );

  // db.query(
  //   'UPDATE emp_details SET employee_name=?, employee_number=?, doj=?, department=?, designation=?, branch=?, salary=? WHERE id=?',
  //   [employee_name, employee_number, doj, department, designation, branch, salary, id],
  //   (err, result) => {
  //     // Your callback logic here
  //     // console.log(err)
  //     res.redirect("/home?msg=employee+details+updated+successfully&msg_type=success")
  //   }
  // );
};
exports.delete = (req, res) => {
  let id = req.params.id;
  db.query("DELETE FROM emp_details WHERE id =?", [id], (err, result) => {
    if (!err) {
      res.redirect("/home");
    } else {
      console.log(err);
    }
  });
};
