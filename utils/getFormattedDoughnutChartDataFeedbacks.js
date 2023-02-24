module.exports = async DATA => {
    let labels = ['Положительно', 'Негативно', 'Нейтрально', 'Не ответили'];
    let datasets = [];
    
    let positiveFeedbackCount = 0;
    let negativeFeedbackCount = 0;
    let noFeedbackCount = 0;
    let neutralFeedbackCount = 0;

    for(let mailing of DATA.mailings){
        for(let number of mailing.numbers){
            if(number.feedback){
                if(number.feedback.isAnswerPositive == true){
                    positiveFeedbackCount++;
                }else if(number.feedback.isAnswerPositive == false){
                    negativeFeedbackCount++;
                }else if(number.feedback.isAnswerPositive == null){
                    neutralFeedbackCount++;
                }
            }else{
                noFeedbackCount++;
            }
        }
    }
    datasets = [positiveFeedbackCount, negativeFeedbackCount, neutralFeedbackCount, noFeedbackCount];

    return {
        labels,
        datasets
    }
}