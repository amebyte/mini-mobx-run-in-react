import { useState, useRef } from "react"
import { ReactiveEffect  } from "@vue/reactivity"
export function observer(baseComponent) {
    return (props) => {
        const [, setState] = useState()
        const admRef = useRef(null)
        if (!admRef.current) {
            admRef.current = new ReactiveEffect(() => {
                return baseComponent(props)
            }, () => {
                setState(Symbol())
            })
        }
        const effect = admRef.current
        return effect.run()
    }
}