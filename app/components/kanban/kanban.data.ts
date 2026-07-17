import { EnumStatus } from "~/types/deals.types";
import type { IColumn } from "./kanban.types";


export const KANBAN_DATA: IColumn[] = [
    {
        id: EnumStatus.todo,
        name: 'Вхідні',
        items: []
    },
    {
        id: EnumStatus["to-be-agreed"],
        name: 'На погодженні',
        items: []
    },
    {
        id: EnumStatus['in-progress'],
        name: 'У виробництві',
        items: []
    },
    {
        id: EnumStatus.produced,
        name: 'Виготовлено',
        items: []
    },
    {
        id: EnumStatus.done,
        name: 'До відвантаження',
        items: []
    },
]