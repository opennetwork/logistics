export const {
    DEFAULT_CURRENCY = "NZD",
    DEFAULT_CURRENCY_SYMBOL = "$",
    DEFAULT_LOCALE: givenDefaultLocale
} = process.env

export const DEFAULT_LOCALE = (
    givenDefaultLocale ||
    (
        process.env.LC_ALL ||
        process.env.LC_MESSAGES ||
        process.env.LANG ||
        process.env.LANGUAGE
    )
)