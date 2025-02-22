const paneEl = document.querySelector(".pl__pane");
const lcolEl = document.querySelector(".pl__lcol-list");
const rcolEl = document.querySelector(".pl__rcol-list");
const cardEl = document.querySelector(".pl__card-list");
const fullEl = document.querySelector(".pl__rcol-full");
const ordrEl = document.querySelector(".pl__rcol-ordr");
const lBtnEl = document.querySelector(".pl__rcol-btn");
const cBtnEl = document.querySelector(".pl__card-btn");

let list = [];
let full;
let ordr;

function getProductList(param) {
    const API = "../../db/data.json";
    fetch(API)
    .then(res => {
        return res.json();
    })
    .then(doc => {
        setProductList({
            list: doc
        });
    })
}

function setProductList(param) {
    const { list } = param;
    list.forEach(item => {
        const { 
            name, 
            image: { mobile: w1, tablet: w2, desktop: w3 }, 
            price, 
            category
        } = item;
        const itemEl = `
            <div class="pl__item">
                <div class="pl__item-card">
                    <picture>
                        <source media="(min-width: 48em)" srcset=${getProductPath(w3)} >
                        <source media="(min-width: 64em)" srcset=${getProductPath(w2)} >
                        <img class="pl__item-view" src=${getProductPath(w1)} alt="${name}" />
                    </picture>
                    <button class="pl__item-pill pl__item-cart btn cart">
                        <img src="./src/assets/images/icon-add-to-cart.svg" alt="" />
                        <div>
                            Add to Cart
                        </div>
                    </button>
                    <div class="pl__item-pill pl__item-ctrl">
                        <div class="pl__item-unit"></div>
                        <button class="pl__item-icon pl__item-lbtn btn less"></button>
                        <button class="pl__item-icon pl__item-rbtn btn plus"></button>
                    </div>
                </div>
                <div class="pl__item-info">
                    <p class="pl__item-type">
                        ${category}
                    </p>
                    <p class="pl__item-name">
                        ${name}
                    </p>
                    <p class="pl__item-cost">${price.toFixed(2)}</p>
                </div>
            </div>
        `;
        lcolEl.insertAdjacentHTML("beforeend", itemEl);
    });
}

function getProductPath(image) {
    return `./src/${image.slice(2)}`;
}

function getProductItem(event) {
    const button = getClickedItem(event);

    if (!button) { return };
    if (button.classList.contains("cart")) {
        const parent = button.parentElement.parentElement;
        button.parentElement.classList.add("selected");
        setProductItem({ step: "plus", elem: parent });
    }
    if (button.classList.contains("less")) {
        const parent = button.parentElement.parentElement.parentElement;
        setProductItem({ step: "less", elem: parent });
    }
    if (button.classList.contains("plus")) {
        const parent = button.parentElement.parentElement.parentElement;
        setProductItem({ step: "plus", elem: parent });
    }
}

function setProductItem(param) {
    const { step, elem } = param;
    const cardEl = elem.querySelector(".pl__item-card");
    const nameEl = elem.querySelector(".pl__item-name");
    const costEl = elem.querySelector(".pl__item-cost");
    const unitEl = elem.querySelector(".pl__item-unit");
    const viewEl = elem.querySelector(".pl__item-view");
    
    let name = nameEl.innerText;
    let unit = unitEl.innerText;

    if (step === "less") {
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            if (item.name === name) {
                unit = item.unit - 1;
                if (!unit) {
                    list = list.toSpliced(i, 1);
                    cardEl.classList.remove("selected");
                    break;
                }
                item = { ...item, unit };
                list = list.toSpliced(i, 1, item);
                break;
            }
        }
    }
    if (step === "plus") {
        let find = null;
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            if (item.name === name) {
                unit = item.unit + 1;
                item = { ...item, unit };
                find = true;
                list = list.toSpliced(i, 1, item);
                break;
            }
        }
        if (!find) {
            let cost = costEl.innerText;
            let view = viewEl.src.replace("mobile", "thumbnail");

            unit = 1;
            list = [...list, {
                name,
                cost: parseFloat(cost),
                unit: unit,
                view
            }];
        }
    }
    
    updProductUnit({
        unit,
        item: unitEl
    });
    updProductCart();
}

function updProductUnit(param) {
    const { unit, item } = param;
    item.innerText = unit;
}

function updProductCart(param) {
    full = 0; /* Total number of item */
    ordr = 0; /* Total amount of item */
    
    if (rcolEl.innerText) {
        rcolEl.replaceChildren();
    }
    
    list.forEach(item => {
        let {
            name,
            unit,
            cost
        } = item;
        let chrg = unit * cost;
        full = full + unit;
        ordr = ordr + chrg;
        
        cost = cost.toFixed(2);
        chrg = chrg.toFixed(2);

        const itemEl = `
            <div class="pl__rcol-cell">
                <div class="pl__rcol-mini">
                    <div class="pl__rcol-name">${name}</div>
                    <div>
                        <span class="pl__rcol-unit">${unit}</span>
                        <span class="pl__rcol-cost">${cost}</span>
                        <span class="pl__rcol-chrg">${chrg}</span>
                    </div>
                </div>
                <button class="pl__rcol-remv btn">
                    <img src="./src/assets/images/icon-remove-item.svg" alt="remv" />
                </button>
            </div>
        `;
        rcolEl.insertAdjacentHTML("beforeend", itemEl);
    });

    ordr = ordr.toFixed(2);
    fullEl.innerText = full;
    ordrEl.innerText = ordr;
}

function popProductItem(event) {
    const button = getClickedItem(event);
    
    if (!button) { return };
    const parent = button.parentElement;
    const target = parent.querySelector(".pl__rcol-name");
    const listEl = document.querySelectorAll(".selected");

    let check = target.innerText;
    let array = Array.from(parent.parentElement.children);
    let index = array.indexOf(parent);

    for (let i = 0; i < listEl.length; i++) {
        let itemEl = listEl[i];
        let nameEl = itemEl.parentElement.querySelector(".pl__item-name");
        let target = nameEl.innerText.trim();

        if (target === check) {
            list = list.toSpliced(index, 1);
            itemEl.classList.remove("selected");
            break;
        }
    }
    updProductCart();
}

function getClickedItem(event) {
    const target = event.target;
    const parent = target.parentElement;

    const button = 
    target.classList.contains("btn") ? target : 
    parent.classList.contains("btn") ? parent : null;

    return button;
}

function setProductPane(event) {
    const target = event.target;
    if (target.classList.contains("show")) {
        const ordrEl = document.querySelector(".pl__card-ordr");
        if (cardEl.innerText) {
            cardEl.replaceChildren();
        }
        list.forEach(item => {
            let {
                name,
                unit,
                cost,
                view
            } = item;
            let chrg = cost * unit;
            cost = cost.toFixed(2);
            chrg = chrg.toFixed(2);

            let itemEl = `
                <div class="pl__card-cell">
                    <div class="pl__card-wrap">
                        <img class="pl__card-view" src="${view}" alt="${name}" />
                        <div>
                            <div class="pl__card-name">${name}</div>
                            <div>
                                <span class="pl__card-unit">${unit}</span>
                                <span class="pl__card-cost">${cost}</span>
                            </div>
                        </div>
                    </div>
                    <div class="pl__card-chrg">${chrg}</div>
                </div>
            `;
            cardEl.insertAdjacentHTML("beforeend", itemEl);
        });
        ordrEl.innerText = ordr;
        paneEl.style.setProperty("display", "flex");
    } else {
        const listEl = document.querySelectorAll(".selected");
        list = [];
        full = 0;
        ordr = 0;
        updProductCart();
        listEl.forEach(itemEl => (
            itemEl.classList.remove("selected")
        ));
        paneEl.style.setProperty("display", "none");
    }
}

window.addEventListener("DOMContentLoaded", () => getProductList());
lcolEl.addEventListener("click", (e) => getProductItem(e));
rcolEl.addEventListener("click", (e) => popProductItem(e));
lBtnEl.addEventListener("click", (e) => setProductPane(e));
cBtnEl.addEventListener("click", (e) => setProductPane(e));