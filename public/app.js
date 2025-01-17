const { response } = require("express");

async function usersignup() {
    const email = document.getElementById("signup-user-email").value;
    const password = document.getElementById("signup-user-pass").value;
    const firstName = document.getElementById("signup-user-firstName").value;
    const lastName = document.getElementById("signup-user-lastName").value;

    try {
        const response = await axios.post("http://localhost:3000/api/v1/user/signup", {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        });
        alert("Signed Upp!!!!");
    } catch (error) {
        console.error(error);//handle error
        alert("NOTTTT  Signed Up");
    }
}

async function usersignin() {
    const email = document.getElementById("signin-user-email").value;
    const password = document.getElementById("signin-user-pass").value;
    alert(email, password);
    try {
        const response = await axios.post("http://localhost:3000/api/v1/user/signin", {
            email: email,
            password: password
        });
        localStorage.setItem("token", response.data.token);
        alert("you are signed in");
    } catch (error) {
        console.error(error);
        alert("you are NOTTT signed in");
    }
}

async function coursePreview() {
    const response = await axios.get("http://localhost:3000/api/v1/course/preview", {
        // headers: {
        //     token: localStorage.getItem("token")
        // }
        //document.getElementById("all-course").innerHTML = "title" + response.data.title + "description" + response.data.description + "price" + response.data.price + "imageUrl" +response.data.imageUrl
    })
}
coursePreview();

// function logout(req,res)(){
// localStorage.removeItem("token");
// }


