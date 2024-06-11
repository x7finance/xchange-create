import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { Button } from "~~/components/ui/button"

type PaginationButtonProps = {
  currentPage: number
  totalItems: number
  // eslint-disable-next-line no-unused-vars
  setCurrentPage: (page: number) => void
}

const ITEMS_PER_PAGE = 20

export const PaginationButton = ({
  currentPage,
  totalItems,
  setCurrentPage,
}: PaginationButtonProps) => {
  const isPrevButtonDisabled = currentPage === 0
  const isNextButtonDisabled =
    currentPage + 1 >= Math.ceil(totalItems / ITEMS_PER_PAGE)

  const prevButtonClass = isPrevButtonDisabled
    ? "bg-zinc-200 cursor-default"
    : "btn btn-primary"
  const nextButtonClass = isNextButtonDisabled
    ? "bg-zinc-200 cursor-default"
    : "btn btn-primary"

  if (isNextButtonDisabled && isPrevButtonDisabled) return null

  return (
    <div className="mx-5 mt-5 flex justify-end gap-3">
      <Button
        variant="ghost"
        className={`${prevButtonClass}`}
        disabled={isPrevButtonDisabled}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </Button>
      <span className="text-primary-content self-center font-medium">
        Page {currentPage + 1}
      </span>
      <Button
        variant="ghost"
        className={`${nextButtonClass}`}
        disabled={isNextButtonDisabled}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <ArrowRightIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
