

const salary = document.getElementById('salary');
const shaft = document.getElementById('shaft');
const gender = document.getElementById('gender');
const education = document.getElementById('education');
const experience = document.getElementById('experience');
const description = document.getElementById('description');
const quantity = document.getElementById('quantity');
const btn1 = document.getElementById('btn1');
const city = document.getElementById('city');
const job = document.getElementById('job');



const out1 = document.getElementById('out1');
const out2 = document.getElementById('out2');
const out3 = document.getElementById('out3');
const out4 = document.getElementById('out4');
const out5 = document.getElementById('out5');
const out6 = document.getElementById('out6');
const out7 = document.getElementById('out7');
const out8= document.getElementById('out8');
const out9 = document.getElementById('out9');


function fun1() {
   out1.innerHTML = salary.value;
   out2.innerHTML = shaft.value;
   out3.innerHTML = gender.value;
   out4.innerHTML = education.value;
   out5.innerHTML = experience.value;
   out6.innerHTML = description.value;
   out7.innerHTML = quantity.value;
   out8.innerHTML = city.value;
   out9.innerHTML = job.value;
   
}

btn1.addEventListener('click',fun1);





