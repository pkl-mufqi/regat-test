const envLabels = process.env.ACCEPTABLE_LABELS;
const allowedLabels = envLabels.split(',');

let label;
for (let i = 0; i < allowedLabels.length; i++) {
  label = allowedLabels[i];
  allowedLabels[i] = label + '=';
}

export { allowedLabels };
