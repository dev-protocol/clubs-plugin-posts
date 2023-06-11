import {atom} from 'nanostores';
import type {Ref, UnwrapRef} from 'vue';
import {ref} from 'vue';

export const selectImages = atom<Ref<UnwrapRef<string[]>>>(ref([]))
