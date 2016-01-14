export default class Person {
    constructor(options) {
        this.name = options.name;
        this.surname = options.surname;
    }

    say(words) {
        console.log(`${this.name} says: ${words}`);
    }
}
