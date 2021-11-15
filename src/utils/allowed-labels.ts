const envLabels = process.env.ACCEPTABLE_LABELS;
let allowedLabels = envLabels.split(',');

let label;
for(let i = 0; i < allowedLabels.length; i++){
    label = allowedLabels[i];
    allowedLabels[i] = label + '=';
}


export { allowedLabels }