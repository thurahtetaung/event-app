import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface EventCardProps {
  id: string
  title: string
  category: string
  date: string
  time: string
  location: string
  price: number
  imageUrl: string
  organizer: string
}

export function EventCard({
  id,
  title,
  category,
  date,
  time,
  location,
  price,
  imageUrl,
  organizer,
}: EventCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card transition-all hover:border-primary/20 hover:shadow-md">
      <Link href={`/events/${id}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={225}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="badge-primary absolute left-3 top-3">
            {category}
          </Badge>
        </div>
        <CardContent className="flex-1 space-y-2.5 border-t border-border/40 p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-card-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">Organized by {organizer}</p>
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/40 p-4">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="font-medium text-card-foreground">
              {price === 0 ? "Free" : `฿${price.toLocaleString()}`}
            </div>
            <Button className="btn-primary">Buy Ticket</Button>
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}