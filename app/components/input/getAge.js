const getAge = (date) => {
    let today = new Date();
    let bDate = new Date(date);
    let age = today.getFullYear() - bDate.getFullYear();
    let m = today.getMonth() - bDate.getMonth();

    if(m < 0 || (m === 0 && today.getDate() < bDate.getDate())){
      age--;
    }

    return age;
}

export default getAge;