signUpName = document.querySelector("#signUpUsername");
signUpEmail = document.querySelector("#signUpEmail");
signUpPassword = document.querySelector("#signUpPassword");
signUpPassConfirm = document.querySelector("#signUpConfirmPassword");
signUpButton = document.querySelector("#createUser");
signUpButton.addEventListener("click", createUser);

function createUser(){
    let alert = document.querySelector("#signUpAlert");
    alert.style.display = "none";
    alert.style.color = "red";
    //TODO: check if username exists
    let password = signUpPassword.value;
    let passConfirm = signUpPassConfirm.value;

    if(password.length < 6){
        alert.style.display="inline";
        alert.textContent = "Password must be 6 characters or more";

    }else if(password != passConfirm){
        alert.style.display="inline";
        alert.textContent = "Passwords do not match!";

    }

    //TODO: else create user
    
}