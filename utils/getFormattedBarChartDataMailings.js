module.exports = async DATA => {
    let months = {
        '01': { name: 'январь' },
        '02': { name: 'февраль' },
        '03': { name: 'март' },
        '04': { name: 'апрель' },
        '05': { name: 'май' },
        '06': { name: 'июнь' },
        '07': { name: 'июль' },
        '08': { name: 'август' },
        '09': { name: 'сентябрь' },
        '10': { name: 'октябрь' },
        '11': { name: 'ноябрь' },
        '12': { name: 'декабрь' }
    }
    
    let labels = []
    let datasets = []

    for(let i = 0; i < DATA.mailings.length; i++){
        for(let month in months){
            if(DATA.mailings[i].date.slice(3,5) == month){
                let monthWithYear = `${months[month].name} ${DATA.mailings[i].date.slice(8,10)} г.`;
                if(labels.find(el => el === monthWithYear)){
                    datasets[labels.indexOf(monthWithYear)]++
                    
                }else{
                    labels.push(monthWithYear)
                    datasets[labels.indexOf(monthWithYear)] = 1
                }
            }
        }
    }
    
    return {
        labels,
        datasets
    }
}