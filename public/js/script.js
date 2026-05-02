signUpName = document.querySelector("#signUpUsername");
signUpEmail = document.querySelector("#signUpEmail");
signUpPassword = document.querySelector("#signUpPassword");
signUpPassConfirm = document.querySelector("#signUpConfirmPassword");
const signUpForm = document.querySelector("#signUpForm");
signUpForm.addEventListener("submit", createUser);

async function createUser(e){
    e.preventDefault();
    let alert = document.querySelector("#signUpAlert");
    alert.style.display = "none";
    alert.style.color = "red";
    let username = signUpName.value;
    let password = signUpPassword.value;
    let passConfirm = signUpPassConfirm.value;

    if(password.length < 6){ //password too short
        alert.style.display="inline";
        alert.textContent = "Password must be 6 characters or more";
        return;
    }else if(password != passConfirm){ //passwords don't match
        alert.style.display="inline";
        alert.textContent = "Passwords do not match!";
        return;
    }

    try{ // check if username is taken
        const response = await fetch('/checkUsername', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        });

        const data = await response.json();

        if(!data.available){
            alert.style.display="inline";
            alert.textContent = "Username is already taken!";
            return;
        }
    } catch (err) {
        alert.style.display="inline";
        alert.textContent = "Error checking username. Try again.";
        console.error(err);
    }

    //Input is validated -> create user
    try{
        const response = await fetch('/createUser', {method: 'POST', 
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                email: signUpEmail.value,
                password: password
            })
        })

        const createUserData = await response.json();

        if(createUserData.success){
            window.location.href = '/'; //redirect to home page
        }else{
            alert.style.display="inline";
            alert.textContent = "Error creating user. Try again.";
        }
    }catch (err) { 
        alert.style.display="inline";
        alert.textContent = "Error creating user. Try again.";
        console.error(err);
    }
    
}