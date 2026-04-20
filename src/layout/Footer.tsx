
export const Footer = () => {
  return(
    <footer className="mt-auto text-sm text-surface-500 w-full flex justify-center items-center px-4 py-4 ">
      <div className="flex flex-col border-t border-white/10  md:flex-row items-center justify-between gap-2 max-w-300 w-full py-5">
        <p>
          © {new Date().getFullYear()} Metal Metrics. All rights reserved.
        </p>
        <p>Built by Wilbur Stanley</p>
      </div>
    </footer>
  )
}