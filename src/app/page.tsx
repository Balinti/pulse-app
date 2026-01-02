import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Clock, TrendingUp, Calendar, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-2xl font-bold">Pulse</div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="mb-6 text-5xl font-bold">
          Prevent burnout before it starts
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          A privacy-first burnout prevention coach for remote workers.
          10-second daily check-ins, calendar metadata insights, and measurable 2-minute experiments.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">Start free trial</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">How Pulse works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Clock className="mb-2 h-8 w-8" />
              <CardTitle>10-second check-ins</CardTitle>
              <CardDescription>
                Two sliders: energy and stress. Optional tags. No journaling required.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="mb-2 h-8 w-8" />
              <CardTitle>Calendar insights</CardTitle>
              <CardDescription>
                Metadata-only integration. We never see event titles or attendees.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="mb-2 h-8 w-8" />
              <CardTitle>2-minute experiments</CardTitle>
              <CardDescription>
                Evidence-based practices. Track what works with next-day outcomes.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Privacy */}
      <section className="border-t bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Shield className="mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-4 text-3xl font-bold">Privacy-first by design</h2>
            <p className="mb-6 text-muted-foreground">
              Your calendar integration is metadata-only. We store meeting start/end times and derive
              metrics, but never access event titles, descriptions, or attendee information.
            </p>
            <p className="text-sm text-muted-foreground">
              Pulse is not therapy or crisis support. For mental health emergencies, contact a licensed
              professional.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Simple, transparent pricing</h2>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="text-3xl font-bold">$0</div>
              <CardDescription>Forever</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Daily check-ins
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  7-day trends
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  3 experiments
                </li>
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  Get started
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="mb-2 w-fit rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                RECOMMENDED
              </div>
              <CardTitle>Pulse Plus</CardTitle>
              <div className="text-3xl font-bold">
                $19.99<span className="text-lg font-normal text-muted-foreground">/mo</span>
              </div>
              <CardDescription>7-day free trial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Everything in Free
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Calendar metadata insights
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Smart recommendations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Unlimited experiments
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  30-day history
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full">Start free trial</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Pulse. Privacy-first burnout prevention.</p>
        </div>
      </footer>
    </div>
  )
}
