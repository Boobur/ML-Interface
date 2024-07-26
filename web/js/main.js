// Modal funksiya chaqrilgani haqida ma'lumot
let CSV_MODAL_STARTED = false;
let MODEL_MODAL_STARTED = false;

// global varaible
// {

let DF_PATH; // csv faylni yo'li
let DF_DATA; // csv fayldan olingan ma'lumot
let DELETE_COLUMNS = []; // o'chirish kerak bo'ladigan ustunlar
let DATE_COLUMNS = ''; // Sana va Vaqt ko'rsatilgan ustun
let DF_NAN = 'delete'; // NAN va NULL elementlarni tozalash
let DF_TRAIN = 80; // Train va Testga bo'lingan ma'lumot miqdori
let DF_ROWS = 100; // Qatorlar soni
let MODEL_SETTING = {}; //Modelimiz sozlamalari
let MODEL_TYPE = 'DecisionTreeRegressor';
let PREDICT_COLUMNS = '';
let RESULT = {};


// }

// Ma'lumotni tanlash va uni inputga yozish.
// ---------------- Start ----------------
let selectOptions = document.querySelectorAll(".options p");
document.querySelector(".dropdown input").value = selectOptions[0].textContent;
selectOptions.forEach((item) => {
    item.addEventListener('click', ()=>{
        let model_type = document.querySelector(".dropdown input");
        if(model_type.value  != item.textContent){
            MODEL_MODAL_STARTED = false;
            MODEL_SETTING = {};
            resetProgress();
        }
        model_type.value = item.textContent;
        MODEL_TYPE = model_type.value;
    })
})
// ---------------- End ------------------

// Modellarni tanlash ro'yxatini ochish
// ---------------- Start ----------------
let dropdown = document.querySelector(".dropdown");
dropdown.addEventListener('click', ()=>{
    dropdown.classList.toggle('active');
})
// ---------------- End ------------------


// Modal csv oynani boshqarish uchun js kod
// ---------------- Start ----------------
let showModalCSV = document.querySelector('.modal-csv');
let csvButton = document.querySelector('.csv-button');
let shaddowModal = document.querySelector('.modal-shaddow');

csvButton.addEventListener('click', () =>{
    if(DF_PATH){
        shaddowModal.classList.toggle('active');
        showModalCSV.classList.toggle('active');
        
        if(!CSV_MODAL_STARTED){
            resetCsvAll();
            fetchDataFrame(DF_DATA, '.right-fieldset .table-container');
            showSettingColsElm();
            showSettingRows();
            showDatetime();
            showPredictData();
            showNanAndNull();
            CSV_MODAL_STARTED = true;
        } 
    }
    else{
        document.querySelector('.file-path input').value = "CSV ni tanlang";
        document.querySelector('.file-path input').style.color = 'red';
    }
})
// ---------------- End ------------------

// Modal oynani yopish tugmasi
// ---------------- Start ----------------
let closeModalCsv = document.querySelector('.modal-csv .close-modal')
closeModalCsv.addEventListener('click', ()=>{
    shaddowModal.classList.toggle('active');
    showModalCSV.classList.toggle('active');
})
// ---------------- End ------------------


// Modal model oynani boshqarish uchun js kod
// ---------------- Start ----------------
let showModalModel = document.querySelector('.modal-model');
let modelButton = document.querySelector('.setting-button');
let modelLegend = document.querySelector('.model-legend');

shaddowModal = document.querySelector('.modal-shaddow');

modelButton.addEventListener('click', () =>{
    modelLegend.innerHTML = document.querySelector(".dropdown input").value;
    if(!MODEL_MODAL_STARTED){
        showModelSetting();
        showDocumentation(modelLegend.innerHTML);
        MODEL_MODAL_STARTED = true;
    }

    shaddowModal.classList.toggle('active');
    showModalModel.classList.toggle('active');

})
// ---------------- End ------------------

// Modal oynani yopish tugmasi
// ---------------- Start ----------------
let closeModalModel = document.querySelector('.modal-model .close-modal')
closeModalModel.addEventListener('click', ()=>{
    shaddowModal.classList.toggle('active');
    showModalModel.classList.toggle('active');
})
// ---------------- End ------------------

 // setting-row-element
// ---------------- Start ----------------

let selectRowCount = document.querySelector('.setting-row-element');
selectRowCount.addEventListener('change', (e) =>{
    if(e.target.matches('input[type="radio"]')){
        if(e.target.checked){
            DF_ROWS = Number(e.target.value); 
        }
        fetchDataFrame(DF_DATA, '.right-fieldset .table-container', DF_ROWS);
    }
})

let deleteColumns = document.querySelector('.setting-col-element');
deleteColumns.addEventListener('change', (e) => {
    if (e.target.matches('input[type="checkbox"]')){
        if(e.target.checked){
            DELETE_COLUMNS.push(e.target.value);
        }
        else{
            DELETE_COLUMNS = DELETE_COLUMNS.filter(el => el != e.target.value)
        }
        fetchDataFrame(DF_DATA, '.right-fieldset .table-container', DF_ROWS, DELETE_COLUMNS);
        showDatetime();
        showPredictData();
    }
})

let settingDate = document.querySelector('.setting-date-element');
settingDate.addEventListener('change', (e) =>{
    if(e.target.tagName == 'SELECT'){
        let selectedOption = e.target.options[e.target.selectedIndex];
        DATE_COLUMNS = selectedOption.value
    }
})


let settingPredict = document.querySelector('.setting-predict-element');
settingPredict.addEventListener('change', (e) =>{
    if(e.target.tagName == 'SELECT'){
        let selectedOption = e.target.options[e.target.selectedIndex];
        PREDICT_COLUMNS = selectedOption.value
    }
})

let changeNaN = document.querySelector('.setting-nan-null-element');
changeNaN.addEventListener('change', (e) => {
    if(e.target.matches('input[type="radio"]')){
        if(e.target.checked){
            DF_NAN = e.target.value;
        }
    }
})

let settingTrainData = document.querySelector('.setting-train-test-element');
settingTrainData.addEventListener('change', (e) => {
    if (e.target.matches('input[type="range"]')){
        DF_TRAIN = e.target.value;
    }
})

let settingModel = document.querySelector('.model-setting-param');
settingModel.addEventListener('change', (e) => {
    MODEL_SETTING = {}
    if (e.target.matches('input[type="text"]')){
        let modelSetting = document.querySelectorAll('.model-setting-param input');
        modelSetting.forEach((item) => {
            if(item.value){
                MODEL_SETTING[item.name] = (item.value)
            }
        })
    }
})
// ---------------- End ------------------


// Train and test

let clickTrainButton = document.querySelector('.train-button');
clickTrainButton.addEventListener('click', () => {
    train_model();
})

let clickTestButton = document.querySelector('.test-button');
clickTestButton.addEventListener('click', () => {
    console.log('click')
    test_model();
})

// DataFrame dialog oynasi bilan ishlash 
// DataFrame ni json ko'rinishida pythondan qaytarish
// return json
// get_dataframe - python funksiya --> app.py
// ---------------- Start ----------------

// .file-path input fayl --> index.html
let fileInput = document.querySelector('.file-path');
fileInput.addEventListener('click', async ()=>{
    let info = await eel.get_dataframe()(); // --> app.py return json
    DF_PATH = info.path; // fayl yolini saqlab olish
    DF_DATA = info.data; // json faylni saqlab olish
    // Agar path tanlansa va u mavjud bo'lsa
    if(DF_PATH){
        // .file-path input --> ma'lumotni inputga kiritish --> index.html
        document.querySelector('.file-path input').value = DF_PATH;
        document.querySelector('.file-path input').style.color = 'black';
        // Olingan ma'lumotni chop etish.
        // index --> main windowda 
        fetchDataFrame(DF_DATA, '.right-grapihcs .table-container');
        // Metkani qaytarish 
        CSV_MODAL_STARTED = false;
    }

});
// ---------------- End ------------------

// ---------------- Start ----------------
// DataFrame chop etish
function fetchDataFrame(file, selector, row = 100, delete_cols = []){
    try {
        // Kelgan ma'lumotni parse yordamida ochib dataga saqlaymiz
        let data = JSON.parse(file);
        //.table-container olamiz --> index.html
        const tableContainer = document.querySelector(selector);
        //  tableContainer ni tozalash kerak:
        tableContainer.innerHTML = '';
        // Jadivalni shakillantiramiz
        const table = document.createElement('table');
        // Jadivalni birinchi title qatori --> tr --> index.html
        const headerRow = document.createElement('tr');
        // Jadivalni kolonkalarni yaratib olamiz
        for (let key in data) {
            if(DELETE_COLUMNS.includes(key)) continue;
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        }
        // Qatorni Jadivalga kiritish
        table.appendChild(headerRow);

        // Namoyish etadigan qatorni ko'rsatamiz.
        const rowCount = row;
        // Sikl yordamida barcha berilgan qatorlardan o'tamiz.

        for (let i = 0; i < rowCount; i++) {
            const bodyRow = document.createElement('tr');
            for (let key in data) {
                if(DELETE_COLUMNS.includes(key)) continue;
                const td = document.createElement('td');
                td.textContent = data[key][i];
                bodyRow.appendChild(td);
            }
            table.appendChild(bodyRow);
        }
        // Yuqorida olingan .table-cotainer ga barchasini joylaymiz
        // .table-cotainer --> index.html
        tableContainer.appendChild(table);
        
    } catch (error) {
        // Aks xolda hatolik yuz bersa uni avval konsolga
        // Keyin table ichiga chiqaramiz.
        console.error('Error parsing JSON:', error);
        tableContainer.appendChild(`<h1> JSON faylda hatolik </h1>`)
    }
}
// ---------------- End ------------------

// ---------------- Start ----------------
// DataFramedan ma'lumotlar olish funktsiyasi

function getDataFrameInfo(file) {

    let data = JSON.parse(file);
    let colsName =  Object.keys(data); // Ustunlar nomini olish
    let allRowsCount = Object.keys(data[colsName[0]]).length; // Qatorlar sonini olish
    return {colsName, allRowsCount}

}

// ---------------- End ------------------

// ---------------- Start ----------------
function createRadio(value, text, checked=false) {
    let radio = document.createElement('input');
    radio.type = 'radio';
    radio.value = value;
    radio.name = 'data_rows';
    radio.checked = checked;
    let span = document.createElement('span');
    span.textContent = text;
    let p = document.createElement('p');
    p.appendChild(radio);
    p.appendChild(span);
    return p;
}

function showSettingRows() {
    if (!DF_PATH) return;

    let settingRowElement = document.querySelector('.setting-row-element');
    let allrows = getDataFrameInfo(DF_DATA).allRowsCount;

    settingRowElement.appendChild(createRadio(100, 100, checked = true));

    if (allrows >= 100) {
        let step = (allrows - allrows % 5) / 5;
        for (let i = 1; i <= 4; i++) {
            settingRowElement.appendChild(createRadio(step * i, step * i));
        }
        settingRowElement.appendChild(createRadio(allrows, 'barchasi'));
    }
}



// ---------------- End ------------------

// ---------------- Start ----------------

function showSettingColsElm(){
    // CSV sozlamalari
    if(DF_PATH){
        // Col elementlar divni chaqirib olish --> index.html
        let settingColElem = document.querySelector('.setting-col-element');
        // DataFrame haqida qo'shimcha ma'lumotlar
        // Ustunlar nomi, Qatorlar soni, Ustunlar soni
        let dataInfo = getDataFrameInfo(DF_DATA);

        // checkbox --> ustunlar nomiga ko'ra chop etish
        dataInfo.colsName.forEach(item =>{
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = item;
            let span = document.createElement('span');
            span.textContent = item;
            let p = document.createElement('p');
            p.appendChild(checkbox);
            p.appendChild(span)
            settingColElem.appendChild(p)
        })
    }
}

// ---------------- End ------------------

function showDatetime(){
    if(DF_PATH){
        let settingDateElem = document.querySelector('.setting-date-element');
        settingDateElem.innerHTML = ''
        let dataInfo = getDataFrameInfo(DF_DATA);
        let select = document.createElement('select');
        let option = document.createElement('option');
        option.value = 'none';
        option.text  = "Unday ustun yo'q";
        select.appendChild(option); 
        dataInfo.colsName.forEach(item =>{
            if(!DELETE_COLUMNS.includes(item)){
                let option = document.createElement('option');
                option.value = item;
                option.text  = item;
                select.appendChild(option); 
            }        
        })
        settingDateElem.appendChild(select);
        
    }
}

//setting-predict-element

function showPredictData(){
    if(DF_PATH){
        let settingPredElem = document.querySelector('.setting-predict-element');
        settingPredElem.innerHTML = ''
        let dataInfo = getDataFrameInfo(DF_DATA);
        let select = document.createElement('select');
        let option = document.createElement('option');
        option.value = 'none';
        option.text  = "Ustunni tanlang!";
        select.appendChild(option); 
        dataInfo.colsName.forEach(item =>{
            if(!DELETE_COLUMNS.includes(item)){
                let option = document.createElement('option');
                option.value = item;
                option.text  = item;
                select.appendChild(option); 
            }               
        })
        settingPredElem.appendChild(select);
        
    }
}


function showNanAndNull(){
    let settingNanNullElement = document.querySelector('.setting-nan-null-element');
    let p = document.createElement('p');
    let radio = document.createElement('input');
    radio.type = 'radio';
    radio.value = 'delete';
    radio.name = 'custom_nan';
    radio.checked = true;
    span = document.createElement('span');
    span.textContent = "O'chirish";
    p.appendChild(radio);
    p.appendChild(span);
    settingNanNullElement.appendChild(p)


    p = document.createElement('p');
    radio = document.createElement('input');
    radio.type = 'radio';
    radio.value = 'avarage';
    radio.name = 'custom_nan';
    span = document.createElement('span');
    span.textContent = "O'rtachasini olish";
    p.appendChild(radio);
    p.appendChild(span);
    settingNanNullElement.appendChild(p)

}


function showModelSetting(){
    let modelSettingContainer = document.querySelector('.model-setting-param');
    modelSettingContainer.innerHTML = '';
    select_model().then((params) =>{
        for (const key in params) {
            let p = document.createElement('p');
            p.innerHTML = key + ': ';
            let input = document.createElement('input');
            input.type = 'text';
            input.placeholder = params[key];
            input.name = key;
            p.appendChild(input); 
            modelSettingContainer.appendChild(p)
        }
    });  
}


function showDocumentation(model){
    let modelDocumentation = document.querySelector('.model-doc-doc');
    modelDocumentation.innerHTML = '';
    fetch('../doc/model_doc.json')
    .then(response => response.json())
    .then(data => {
        data = data[model];
        let h2 = document.createElement('h2');
        h2.innerText = data['title'];
        modelDocumentation.appendChild(h2)
        data['params'].forEach(item =>{
        let div = document.createElement('div')
        for(let key in item){
            let p = document.createElement('p');
            let span = document.createElement('span')
            span.innerText = key;
            p.innerText = item[key]
            div.appendChild(span);
            div.appendChild(p);
        }  
        modelDocumentation.appendChild(div)   
      })
      
    })
    .catch(error => {
        console.error('xatolik:', error);
    });
}

// Allert Modal oynani oshish 
function showAllertModal(alert){
    let allertModal = document.querySelector('.modal-allert');
    let shaddowModal = document.querySelector('.modal-shaddow');
    let message = document.querySelector('.modal-allert p');

    message.innerText = alert;

    shaddowModal.classList.toggle('active');
    allertModal.classList.toggle('active');

    setTimeout(() =>{
        shaddowModal.classList.toggle('active');
        allertModal.classList.toggle('active');
    }, 15000)
}


// Allert Modal oynani yopish tugmasi
// ---------------- Start ----------------
let closeModalAllert = document.querySelector('.modal-allert .close-modal')
closeModalAllert.addEventListener('click', ()=>{
    let allertModal = document.querySelector('.modal-allert');
    let shaddowModal = document.querySelector('.modal-shaddow');

    shaddowModal.classList.toggle('active');
    allertModal.classList.toggle('active');
   
})
// ---------------- End ------------------



function resetCsvAll(){

    // Tools oynasini tozalash
    document.querySelector('.setting-row-element').innerHTML = '';
    document.querySelector('.setting-col-element').innerHTML = '';
    document.querySelector('.setting-date-element').innerHTML = '';
    document.querySelector('.setting-predict-element').innerHTML = '';
    document.querySelector('.setting-nan-null-element').innerHTML = '';

}

function updateProgress(){
    let progressCircle = document.querySelector('.penel-2 .progress');
    let progressValue = document.querySelector('.penel-2 .progress-text .score');

    let progressStartValue = 0;
    let progressEndValue = 100;
    let speed = 50;

    let progress = setInterval(()=>{
        progressStartValue++;

        progressValue.textContent = `${progressStartValue}`;
        progressCircle.style.background = `conic-gradient(#ffffff ${progressStartValue * 3.6}deg, #cccccc 0deg)`

        if(progressStartValue == progressEndValue ){
            clearInterval(progress)
        }

    }, speed)
}

function resetProgress(){
    let scoreCircle = document.querySelector('.penel-3 .progress');
    let scoreValue = document.querySelector('.penel-3 .progress-text .score');
    let progressCircle = document.querySelector('.penel-2 .progress');
    let progressValue = document.querySelector('.penel-2 .progress-text .score');

    scoreCircle.style.background = `conic-gradient(#ffffff, 0deg, #cccccc 0deg)`;
    scoreValue.textContent = 0;
    progressCircle.style.background = `conic-gradient(#ffffff, 0deg, #cccccc 0deg)`;
    progressValue.textContent = 0;
}

function updateScore(score){
    let scoreCircle = document.querySelector('.penel-3 .progress');
    let scoreValue = document.querySelector('.penel-3 .progress-text .score');

    let scoreStartValue = 0;
    let scoreEndValue = score;
    let speed = 70;
    let conicStyle = '';


    let progress = setInterval(()=>{
        if(score > 0){
            scoreStartValue++;
            conicStyle =  `conic-gradient(#ffffff, ${scoreStartValue* 3.6}deg, #cccccc 0deg)`
        }
        else{
            scoreStartValue--;
            conicStyle =  `conic-gradient(#cccccc, ${360-scoreStartValue * 3.6}deg, #dc143c 0deg)`
        }
        
        
        scoreValue.textContent = `${scoreStartValue}`;
        scoreCircle.style.background = conicStyle;

        if(scoreStartValue == scoreEndValue){
            clearInterval(progress)
        }

    }, speed)
}


// Send function to python 
async function select_model(){
    let modelType = document.querySelector(".dropdown input").value;
    let model_param = await eel.select_model(modelType)();
    return model_param;
}

async function train_model(){
    if(DF_PATH && PREDICT_COLUMNS){

        let train_result = await eel.train_model(MODEL_TYPE, MODEL_SETTING, DF_PATH, DELETE_COLUMNS, PREDICT_COLUMNS, DATE_COLUMNS, DF_NAN, DF_TRAIN)();
        if(typeof(train_result) == 'string'){
            showAllertModal(train_result);
        }
        else{
            updateProgress();
        }
        RESULT = train_result;
        console.log(RESULT['Y_test']);

    }else{
        showAllertModal();
    }
    
}

function test_model(){
    if(RESULT['r2_score']){
        updateScore(Math.round(RESULT['r2_score'] * 100));
        canvas = document.getElementById("stackedArea");
        ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        showGraphics(RESULT['sample'], RESULT['Y_test'], RESULT['predict'])
    } 
}

