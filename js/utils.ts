

type IMatchFunc = (env: MatchEnv, isFinal: boolean, arg?: any) => boolean | void;
type IFound = Array<[any, string, number]>;

type IWalker = (next: IMatchFunc) => IMatchFunc;

interface IPattern {
    match?: IMatchFunc,
    walker: IWalker
}

export {
    getRange,
    walker,
    MatchEnv,
    IPattern,
    IFound,
    IMatchFunc,
    IWalker,
    matchUnits,
    matchManyTimes,
}
function matchUnits(next: IMatchFunc, patterns: Array<IPattern>, useMatchAll: boolean): IMatchFunc {

    const matches = patterns.map(pattern => pattern.walker(null));
    const indexs = matches.map((_, index) => index);

    const comMatches = next && patterns.map(pattern => pattern.walker(next));

    return function (env: MatchEnv, isFinal: boolean) {
        let maxIndex: number;
        let maxRecord: IFound;
        const res = env.found;
        env.found = [];

        walk(indexs);
        env.found = res;
        if (maxRecord) {
            res.push(...maxRecord);
            env.index = maxIndex;
            return true;
        }

        function walk(indexs: Array<number>) {
            const state = env.store();
            const length = indexs.length;
            for (let i = 0; i < length; i += 1) {
                const index = indexs[i];

                if (!matches[index](env, false)) {
                    continue;
                }
                if (length > 1 && walk(indexs.slice(0, i).concat(indexs.slice(i + 1)))) {
                    return true;
                }

                if ((useMatchAll && length > 1)) {
                    env.restore(state);
                    continue;
                }
                if (comMatches || isFinal) {
                    env.restore(state);
                    if (!(comMatches || matches)[index](env, isFinal)) {
                        continue;
                    }
                }

                if (env.compareIndex(maxIndex) < 0) {
                    maxRecord = env.found.slice();
                    maxIndex = env.index;
                    if (env.isSuccess(true, 0)) {
                        return true;
                    }
                }
                env.restore(state);
            }
        }
    }
}

function matchManyTimes(
    next: IMatchFunc,
    pattern: IPattern,
    min: number,
    max: number,
    nonGreedy?: boolean
): IMatchFunc {
    const match = pattern.walker(null);

    if (next) {
        const comMatch = pattern.walker(next);

        return !nonGreedy
            ? function (env, isFinal) {

                return walk(0);

                function walk(step: number) {
                    const state = env.store();
                    if (step < max) {
                        if (match(env, false)) {
                            if (
                                walk(step + 1)
                                || (
                                    env.restore(state)
                                    , step >= min - 1
                                    && comMatch(env, isFinal)
                                )
                            ) {
                                return true;
                            }
                        }
                    }
                    if (step >= min && next(env, isFinal)) {
                        return true;
                    }
                }
            }
            : function (env, isFinal) {
                if (min <= 0 && next(env, isFinal)) {
                    return true;
                }
                if (max > 0) {
                    const state = env.store();
                    let step = 1;
                    while (true) {
                        if (step >= min && comMatch(env, isFinal)) {
                            return true;
                        }
                        if (++step > max || !match(env, false)) {
                            break;
                        }
                    }
                    env.restore(state);
                }
            }
    } else {
        return function (env, isFinal) {
            return walk(0);

            function walk(step: number) {
                if (step < max) {
                    const state = env.store();
                    if (match(env, false)) {
                        if (
                            walk(step + 1)
                            || (
                                env.restore(state),
                                isFinal
                                && step >= min - 1
                                && match(env, true)
                            )
                        ) {
                            return true;
                        }
                    }
                }
                if (step >= min && env.isSuccess(isFinal, 0)) {
                    return true;
                }
            }
        }

    }



}

function walker(match: IMatchFunc) {
    return function (next: IMatchFunc): IMatchFunc {
        if (next) {
            return function (env, isFinal, arg) {
                const state = env.store();
                if (match(env, false, arg)) {
                    if (next(env, isFinal)) {
                        return true;
                    }
                    env.restore(state);
                }
            };
        }
        return match;
    }
}

class MatchEnv {
    index: number;
    token: any;
    found: IFound = [];
    success = false;
    constructor(public tokens: Array<any>, public pattern?: IPattern) {
        let index = 0;

        this.token = tokens[index];
        Object.defineProperties(this, {
            index: {
                get() { return index; },
                set(val: number) {
                    index = val;
                    this.token = this.tokens[index];
                }
            }
        });
    }
    store(): [number, number] {
        return [this.index, this.found.length];
    }
    restore([index, length]: [number, number]) {
        this.index = index;
        this.found.length = length;
    }
    next() {
        const { index, tokens } = this;
        if (tokens.length > index) {
            this.index = index + 1;
        }
        return index;
    }
    prev() {
        const index = this.index;
        if (index > 0) {  // 会使 token = undefined
            this.index = index - 1;
        }
        return index;
    }
    compareIndex(index: number = -1) {
        return index - this.index;
    }
    isSuccess(isFinal: boolean, offset: number) {
        return !isFinal || this.index >= this.tokens.length - offset;
    }
}


function isPositiveInteger(value: number) {
    return typeof value === "number" && value >= 0 && !(value % 1);
}

function getRange(tokens: Array<any>) {
    let index = 0;
    let value = tokens[index];
    const range: [number, number] = [value, value];

    do {
        value = tokens[index];
        if (!isPositiveInteger(value)) {
            debugger;
        }
        range[index >> 1] = value;

        index += 2;
        if (index - 1 < tokens.length) {
            if (tokens[index - 1].value !== ",") {
                debugger;
            } else {
                range[index >> 1] = Number.MAX_SAFE_INTEGER;
            }
        }
    } while (index < tokens.length)

    return range;
}
