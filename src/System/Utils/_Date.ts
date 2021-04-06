export default {
    HoursAgo: (num: number) : number => {
        const date = new Date();
        date.setHours(date.getHours() - num, date.getMinutes(), date.getSeconds(), date.getMilliseconds());
        return (date.getTime() / 1000) | 0;
    },
    DaysAgo: (num: number) : number => {
        const date = new Date();
        // date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - num);
        return (date.getTime() / 1000) | 0;
    },

    SecondsAgo: (num: number) : number => {
        const date = new Date();
        date.setHours(date.getHours(), date.getMinutes(), date.getSeconds() - num, date.getMilliseconds());
        return (date.getTime() / 1000) | 0;
    },

    YearsToGo: (num: number, hour = 0, minute = 0, seconds = 0) : number => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + num);
        if (hour) date.setHours(hour);
        if (minute) date.setMinutes(minute);
        if (seconds) date.setSeconds(seconds);
        return (date.getTime() / 1000) | 0;
    },

    MonthsToGo: (num: number, hour = 0, minute = 0, seconds = 0) : number => {
        const date = new Date();
        date.setMonth(date.getMonth() + num);
        if (hour) date.setHours(hour);
        if (minute) date.setMinutes(minute);
        if (seconds) date.setSeconds(seconds);
        return (date.getTime() / 1000) | 0;
    },

    DaysToGo: (num: number, hour = 0, minute = 0, seconds = 0) : number => {
        const date = new Date();
        date.setDate(date.getDate() + num);
        if (hour) date.setHours(hour);
        if (minute) date.setMinutes(minute);
        if (seconds) date.setSeconds(seconds);
        return (date.getTime() / 1000) | 0;
    }

};
