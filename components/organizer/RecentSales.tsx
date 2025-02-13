import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const recentSales = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", amount: 100 },
  { id: 2, name: "Bob Smith", email: "bob@example.com", amount: 250 },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", amount: 150 },
]

export default function RecentSales() {
  return (
    <div className="space-y-8">
      {recentSales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/${sale.email}`} alt={sale.name} />
            <AvatarFallback>
              {sale.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium">+${sale.amount.toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}

