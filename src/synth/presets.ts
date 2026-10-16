import type {Feeling} from './model'
import type {Arrangement} from './score-kit'
import {house} from './scores/house'
import {techno} from './scores/techno'
import {breaks} from './scores/breaks'
import {dnb} from './scores/dnb'
export type {Arrangement} from './score-kit'
export const arrangements: Record<Feeling,Arrangement> = {house:house(),techno:techno(),breaks:breaks(),dnb:dnb()}
