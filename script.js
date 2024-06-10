document.getElementById('both').classList.add('hidden');
// Переменная для хранения текущего индекса редактируемой покупки
let currentEditIndex = null;

// Функция открытия формы добавления покупки
function openAddPurchaseForm() {
    document.getElementById('both').style.display = 'block';
    document.getElementById('addPurchaseForm').style.display = 'block';
    document.getElementById('purchaseHistory').style.display = 'none';
    document.getElementById('analytics').style.display = 'none';

    // Сбрасываем текущий индекс редактирования
    currentEditIndex = null;

    // Очищаем поля формы
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
}

// Функция отображения истории покупок
function showPurchaseHistory() {
    document.getElementById('both').style.display = 'block';
    document.getElementById('addPurchaseForm').style.display = 'none';
    document.getElementById('purchaseHistory').style.display = 'block';
    document.getElementById('analytics').style.display = 'none';

    // Загружаем данные из локального хранилища браузера и отображаем их в списке
    const purchaseList = document.getElementById('purchaseList');
    purchaseList.innerHTML = ''; // Очищаем список перед обновлением

    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    purchases.forEach((purchase, index) => {
        const listItem = document.createElement('li');

        // Отображаем информацию о покупке
        const purchaseText = document.createElement('span');
        purchaseText.textContent = `${purchase.productCategory} ${purchase.productName} ${purchase.productPrice} руб.`;

        // Добавляем кнопки "Редактировать" и "Удалить"
        const editButton = document.createElement('button');
        editButton.classList.add('edit-button'); 
        editButton.onclick = () => editPurchase(index); // Вызываем функцию editPurchase с индексом

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button'); 
        deleteButton.onclick = () => deletePurchase(index); // Вызываем функцию deletePurchase с индексом

        // Создаем контейнер для текста и кнопок
        const buttonContainer = document.createElement('div');
        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);

        // Добавляем текст и контейнер с кнопками в элемент списка
        listItem.appendChild(purchaseText);
        listItem.appendChild(buttonContainer);

        // Добавляем элемент списка в purchaseList
        purchaseList.appendChild(listItem);
    });
}

// Функция добавления покупки
function addPurchase() {
    const productName = document.getElementById('productName').value.trim();
    const productPrice = document.getElementById('productPrice').value.trim();
    const productCategory = document.getElementById('productCategory').value;

    // Проверяем наличие значений в полях
    if (!productName || !productPrice) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    // Проверяем, является ли productPrice числом
    if (isNaN(productPrice)) {
        alert('Пожалуйста, введите цену товара в числовом формате');
        return;
    }

    // Получаем существующие покупки из локального хранилища или создаем новый массив
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];

    if (currentEditIndex !== null) {
        // Обновляем существующую покупку
        purchases[currentEditIndex] = {
            productCategory,
            productName,
            productPrice,
        };
        currentEditIndex = null; // Сбрасываем индекс редактирования
    } else {
        // Добавляем новую покупку в массив
        purchases.push({
            productCategory,
            productName,
            productPrice,
        });
    }

    // Сохраняем обновленный массив в локальное хранилище
    localStorage.setItem('purchases', JSON.stringify(purchases));

}

// Функция редактирования покупки
function editPurchase(index) {
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    const purchaseToEdit = purchases[index];

    // Сохраняем индекс редактируемой покупки
    currentEditIndex = index;

    // Отображаем форму для редактирования
    document.getElementById('both').style.display = 'block';
    document.getElementById('addPurchaseForm').style.display = 'block';
    document.getElementById('purchaseHistory').style.display = 'none';
    document.getElementById('analytics').style.display = 'none';

    // Заполняем поля формы существующими значениями
    document.getElementById('productName').value = purchaseToEdit.productName;
    document.getElementById('productPrice').value = purchaseToEdit.productPrice;
    document.getElementById('productCategory').value = purchaseToEdit.productCategory;
}

// Функция удаления покупки
function deletePurchase(index) {
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];

    // Удаляем покупку по указанному индексу
    purchases.splice(index, 1);

    // Сохраняем обновленный массив в localStorage
    localStorage.setItem('purchases', JSON.stringify(purchases));

    // Обновляем историю покупок для отражения изменений
    showPurchaseHistory();
}

// Переменная для хранения текущего графика
let currentChart = null;

// Функция отображения аналитики
function showAnalytics() {
    document.getElementById('both').style.display = 'block';
    document.getElementById('addPurchaseForm').style.display = 'none';
    document.getElementById('purchaseHistory').style.display = 'none';
    document.getElementById('analytics').style.display = 'block';

    // Получаем покупки из localStorage
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    
    // Вычисляем общие расходы для каждой категории
    const categoryExpenses = {};
    purchases.forEach(purchase => {
        const category = purchase.productCategory;
        const price = parseFloat(purchase.productPrice);
        categoryExpenses[category] = (categoryExpenses[category] || 0) + price;
    });

    // Подготавливаем данные для круговой диаграммы
    const labels = Object.keys(categoryExpenses);
    const data = Object.values(categoryExpenses);

    // Вычисляем общие расходы
    const totalExpenses = data.reduce((total, expense) => total + expense, 0);

    // Вычисляем процент для каждой категории
    const percentages = data.map(expense => (expense / totalExpenses) * 100);

    // Форматируем проценты с двумя знаками после запятой
    const formattedPercentages = percentages.map(percent => percent.toFixed(2));

    // Проверяем, существует ли текущий график и уничтожаем его, если он существует
    if (currentChart) {
        currentChart.destroy();
    }

    // Создаем круговую диаграмму
    const ctx = document.getElementById('pieChart').getContext('2d');
    currentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: formattedPercentages,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
            }],
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 16,   // Размер шрифта
                            family: 'Arial', // Семейство шрифта
                            style: 'normal', // Стиль шрифта (normal, italic, oblique)
                            weight: '500', // Толщина шрифта (medium)
                        }
                    }
                }
            }
        }
    });
}
