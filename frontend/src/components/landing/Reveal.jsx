import { useInView } from 'react-intersection-observer'

export default function Reveal({ children, className = '', delay = 0 }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.12 })
  return <div ref={ref} className={`transition-all duration-700 ease-out motion-reduce:transition-none ${inView ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}
