import { atom } from 'nanostores'
import type { Ref } from 'vue'
import { ref } from 'vue'

export const selectImages = atom<Ref<readonly string[]>>(ref([]))
export const selectImagesFile = atom<Ref<readonly File[]>>(ref([]))
