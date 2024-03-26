interface IHeaderTranslation {
  input: string;
  output: string;
  startsWith: boolean;
}
const headerTranslations: IHeaderTranslation[] = [
  {input: '\n', output: '', startsWith: false},
  {input: '\r', output: '', startsWith: false},
  {input: '"', output: '', startsWith: false},
  {input: '`', output: '', startsWith: false},
  {input: ' ', output: '_', startsWith: false},
  {input: '/', output: '_', startsWith: false},
  {input: '\\', output: '_', startsWith: false},
  {input: '-', output: '_', startsWith: false},
  {input: '(', output: '', startsWith: false},
  {input: ')', output: '', startsWith: false},
  {input: '[', output: '', startsWith: false},
  {input: ']', output: '', startsWith: false},
  {input: '{', output: '', startsWith: false},
  {input: '}', output: '', startsWith: false},
  {input: '&', output: '_and_', startsWith: false},
  {input: '+', output: '_plus_', startsWith: false},
  {input: ',', output: '_', startsWith: false},
  {input: '.', output: '_', startsWith: false},
  {input: '#', output: '_number_', startsWith: false},
  {input: '%', output: '_percent_', startsWith: false},
  {input: '*', output: '_times_', startsWith: false},
  {input: '@', output: '_at_', startsWith: false},
  {input: '!', output: '_not_', startsWith: false},
  {input: '?', output: '_question_', startsWith: false},
  {input: '$', output: '_dollar_', startsWith: false},
  {input: '^', output: '_to_the_power_of_', startsWith: false},
  {input: '=', output: '_equals_', startsWith: false},
  {input: '<', output: '_less_than_', startsWith: false},
  {input: '>', output: '_greater than_', startsWith: false},
  {input: '|', output: '_or_', startsWith: false},
  {input: '~', output: '_approximately_', startsWith: false},
  {input: '0', output: 'zero_', startsWith: true},
  {input: '1', output: 'one_', startsWith: true},
  {input: '2', output: 'two_', startsWith: true},
  {input: '3', output: 'three_', startsWith: true},
  {input: '4', output: 'four_', startsWith: true},
  {input: '5', output: 'five_', startsWith: true},
  {input: '6', output: 'six_', startsWith: true},
  {input: '7', output: 'seven_', startsWith: true},
  {input: '8', output: 'eight_', startsWith: true},
  {input: '9', output: 'nine_', startsWith: true},
];

interface IInboundColumn {
  index: number;
  origionalName: string;
  cleanedName: string;
  finalName: string;
  isIncluded: boolean;
}

export class BasicColumnNameProcessor {
  private columns: IInboundColumn[] = [];
  constructor() {}
  private cleanColumnName(name: string): string {
    let tempName = name.trim().toLowerCase();
    let cleanedName: string[] = [];
    for (let i = 0; i < tempName.length; i++) {
      let char = tempName[i];
      let replaceRule = headerTranslations.find((x) => x.input === char);
      if (replaceRule) {
        if (replaceRule.startsWith && i === 0) {
          cleanedName.push(replaceRule.output);
        } else if (!replaceRule.startsWith) {
          cleanedName.push(replaceRule.output);
        } else {
          cleanedName.push(char);
        }
      } else {
        cleanedName.push(char);
      }
    }
    let cleanName = cleanedName.join('');
    let leadingUnderscoreCount = 0;
    for (let i = 0; i < cleanName.length; i++) {
      if (cleanName[i] === '_') {
        leadingUnderscoreCount++;
      } else {
        break;
      }
    }
    if (leadingUnderscoreCount > 0) {
      cleanName = cleanName.substring(leadingUnderscoreCount);
    }
    return cleanName;
  }
  public AddColumn(name: string) {
    let cleanedName = this.cleanColumnName(name);
    let duplicateNames = this.columns.filter((x) => x.cleanedName === cleanedName);
    let finalName = duplicateNames.length === 0 ? cleanedName : `${cleanedName}_${duplicateNames.length}`;
    let index = this.columns.length;
    this.columns.push({index, origionalName: name, cleanedName, isIncluded: true, finalName});
  }
  public getColumn(index: number): IInboundColumn {
    return this.columns[index];
  }

  public disableColumn(index: number) {
    this.columns[index].isIncluded = false;
  }
}
